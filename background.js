// ============================================================
// HTTP Request Capture - Background Service Worker
// ============================================================

let isCapturing = false;
let capturedRequests = [];
const MAX_REQUESTS = 5000;
const STALE_ENTRY_TTL_MS = 30000; // 30s
const CLICK_TRACE_TTL_MS = 15000;
const CLICK_TRACE_GAP_MS = 3000;
const SAVE_DEBOUNCE_MS = 500;
const POPUP_BATCH_SIZE = 1000;
let requestIdCounter = 0;
let activeTabId = null;
let saveDebounceTimer = null;
let proxyTarget = '';
let proxyPathFrom = '';
let proxyPathTo = '';
let proxyCustomCookie = '';
let postmanApiKey = '';
let postmanWorkspace = '';


// popup 长连接端口 (流式推送)
const connectedPorts = new Set();

// pendingRequests: requestId -> partial request data
const pendingRequests = new Map();

// capturedRequests: url -> { headers, body, method, time } (来自 content script 注入)
const capturedRequestsMap = new Map();

// tabContextMap: tabId -> { pageTitle, pageUrl, updatedAt } (来自 PAGE_CONTEXT 消息)
const tabContextMap = new Map();

// clickTraceMap: tabId -> recent click traces from content script, used as webRequest fallback
const clickTraceMap = new Map();

// 状态加载完成标记 + 等待队列 (解决 SW 重启后的竞态条件)
let stateLoaded = false;
const stateLoadedCallbacks = [];

function onStateLoaded() {
  stateLoaded = true;
  // 执行所有等待的回调
  const callbacks = stateLoadedCallbacks.slice();
  stateLoadedCallbacks.length = 0;
  for (const cb of callbacks) {
    try { cb(); } catch (e) {}
  }
  // 注意：这里不调用 notifyPortsStateUpdate()，
  // 因为回调队列中的 INIT 已携带正确状态。
  // 延迟的 STATE_UPDATE 可能在用户点击 START 后才到达，
  // 导致用陈旧数据覆盖运行时状态。
}

function notifyPortsStateUpdate() {
  const msg = {
    type: 'STATE_UPDATE',
    isCapturing,
    total: capturedRequests.length,
    requests: capturedRequests.slice(-POPUP_BATCH_SIZE)
  };
  for (const port of connectedPorts) {
    try {
      port.postMessage(msg);
    } catch (e) {
      connectedPorts.delete(port);
    }
  }
}

// ----------------------------------------
// 存储状态 (session优先 + local备份)
// ----------------------------------------
function saveSessionState() {
  // 将 isCapturing 写入 session storage（内存级，SW重启后仍保留，浏览器关闭后清除）
  // 在 START/STOP 时同步调用，确保 SW 终止前已完成写入
  try { chrome.storage.session.set({ isCapturing }); } catch (e) {}
}

function saveCoreState() {
  const configState = {
    proxyTarget,
    proxyPathFrom,
    proxyPathTo,
    proxyCustomCookie,
    postmanApiKey,
    postmanWorkspace
  };
  try { chrome.storage.session.set(configState); } catch (e) {}
}

function saveState(callback) {
  // 保存配置 + 请求数据（不保存 isCapturing）
  saveCoreState();
  const data = {
    capturedRequests: capturedRequests.slice(-MAX_REQUESTS),
    activeTabId,
    proxyTarget,
    proxyPathFrom,
    proxyPathTo,
    proxyCustomCookie,
    postmanApiKey,
    postmanWorkspace
  };
  chrome.storage.local.set(data, () => {
    if (chrome.runtime.lastError) {
      console.warn('storage.local quota exceeded, truncating capturedRequests to 50');
      chrome.storage.local.set({
        capturedRequests: capturedRequests.slice(-50),
        activeTabId
      }, () => { if (callback) callback(); });
      return;
    }
    if (callback) callback();
  });
}

function debouncedSave() {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    const data = {
      capturedRequests: capturedRequests.slice(-MAX_REQUESTS),
      activeTabId
    };
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        chrome.storage.local.set({ capturedRequests: capturedRequests.slice(-50) });
      }
    });
  }, SAVE_DEBOUNCE_MS);
}

let loadStateCalled = false;

function loadState() {
  if (loadStateCalled) return;
  loadStateCalled = true;

  chrome.storage.session.get(
    ['capturedRequests', 'isCapturing', 'activeTabId', 'proxyTarget', 'proxyPathFrom', 'proxyPathTo', 'proxyCustomCookie', 'postmanApiKey', 'postmanWorkspace'],
    (sessionData) => {
      // 从 session storage 恢复 isCapturing（跨 SW 重启保留，浏览器重启后清除）
      // session storage 在 SW 执行期间同步写入，不存在竞态
      if (sessionData.isCapturing !== undefined) {
        isCapturing = sessionData.isCapturing;
      }
      if (sessionData.capturedRequests && sessionData.capturedRequests.length > 0) {
        capturedRequests.push(...sessionData.capturedRequests);
        requestIdCounter = capturedRequests.reduce((max, r) => Math.max(max, r.id || 0), requestIdCounter);
      }
      activeTabId = sessionData.activeTabId || null;
      if (sessionData.proxyTarget) proxyTarget = sessionData.proxyTarget;
      if (sessionData.proxyPathFrom) proxyPathFrom = sessionData.proxyPathFrom;
      if (sessionData.proxyPathTo) proxyPathTo = sessionData.proxyPathTo;
      if (sessionData.proxyCustomCookie) proxyCustomCookie = sessionData.proxyCustomCookie;
      if (sessionData.postmanApiKey) postmanApiKey = sessionData.postmanApiKey;
      if (sessionData.postmanWorkspace) postmanWorkspace = sessionData.postmanWorkspace;

      if (sessionData.capturedRequests !== undefined || sessionData.isCapturing !== undefined) {
        // session storage 可能只有 isCapturing（由 saveSessionState 写入），
        // 但 capturedRequests 仅持久化在 local storage。
        // 当 session 中 capturedRequests 为空时，需要从 local storage 补充恢复，
        // 防止 SW 重启后请求列表丢失。
        if (!sessionData.capturedRequests || sessionData.capturedRequests.length === 0) {
          chrome.storage.local.get(['capturedRequests'], (localData) => {
            if (localData.capturedRequests && localData.capturedRequests.length > 0) {
              capturedRequests.push(...localData.capturedRequests);
              requestIdCounter = capturedRequests.reduce((max, r) => Math.max(max, r.id || 0), requestIdCounter);
            }
            if (isCapturing) registerListeners();
            ensureAlarm();
            updateBadge();
            onStateLoaded();
          });
          return;
        }
        if (isCapturing) registerListeners();
        ensureAlarm();
        updateBadge();
        onStateLoaded();
        return;
      }

      // session 完全为空，回退到 local storage
      chrome.storage.local.get(
        ['capturedRequests', 'activeTabId', 'proxyTarget', 'proxyPathFrom', 'proxyPathTo', 'proxyCustomCookie', 'postmanApiKey', 'postmanWorkspace'],
        (localData) => {
          if (localData.capturedRequests) {
            capturedRequests.push(...localData.capturedRequests);
            requestIdCounter = capturedRequests.reduce((max, r) => Math.max(max, r.id || 0), requestIdCounter);
          }
          activeTabId = localData.activeTabId || null;
          if (localData.proxyTarget) proxyTarget = localData.proxyTarget;
          if (localData.proxyPathFrom) proxyPathFrom = localData.proxyPathFrom;
          if (localData.proxyPathTo) proxyPathTo = localData.proxyPathTo;
          if (localData.proxyCustomCookie) proxyCustomCookie = localData.proxyCustomCookie;
          if (localData.postmanApiKey) postmanApiKey = localData.postmanApiKey;
          if (localData.postmanWorkspace) postmanWorkspace = localData.postmanWorkspace;
          // 不从 local 恢复 isCapturing — 仅 session storage 负责
          ensureAlarm();
          updateBadge();
          onStateLoaded();
        }
      );
    }
  );
}

// ----------------------------------------
// 图标徽标
// ----------------------------------------
function updateBadge() {
  const count = capturedRequests.length;
  if (count > 0) {
    const text = count > 999 ? '999+' : String(count);
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: '#4a8cff' });
  } else {
    clearBadge();
  }
}

function clearBadge() {
  try {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'HTTP Request Capture' });
  } catch(e) {}
}

function cancelPendingSave() {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
}

function clearTransientCaptureState() {
  pendingRequests.clear();
  capturedRequestsMap.clear();
  clickTraceMap.clear();
}

function removePendingRequestsByDomain(domain) {
  for (const [requestId, entry] of pendingRequests.entries()) {
    try {
      if (new URL(entry.url).hostname === domain) {
        pendingRequests.delete(requestId);
      }
    } catch (e) {
      if (entry.url === domain) {
        pendingRequests.delete(requestId);
      }
    }
  }

  for (const [key, entry] of capturedRequestsMap.entries()) {
    try {
      if (new URL(entry.url).hostname === domain) {
        capturedRequestsMap.delete(key);
      }
    } catch (e) {
      if (entry.url === domain) {
        capturedRequestsMap.delete(key);
      }
    }
  }
}

function clearAllCapturedState(callback) {
  cancelPendingSave();
  capturedRequests.length = 0;
  requestIdCounter = 0;
  clearTransientCaptureState();
  clearBadge();
  const data = {
    capturedRequests: [],
    activeTabId,
    proxyTarget,
    proxyPathFrom,
    proxyPathTo,
    proxyCustomCookie,
    postmanApiKey,
    postmanWorkspace
  };
  chrome.storage.local.set(data, () => {
    chrome.storage.session.remove(['capturedRequests'], () => {
      if (callback) callback();
    });
  });
}

// ----------------------------------------
// 过滤无关请求
// ----------------------------------------
function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (d.toDateString() === now.toDateString()) return timeStr;
    return `${(d.getMonth() + 1)}/${d.getDate()} ${timeStr}`;
  } catch (e) {
    return new Date(ts).toLocaleTimeString();
  }
}

function shouldCapture(details) {
  if (details.url.startsWith('chrome-extension://')) return false;
  if (details.url.startsWith('chrome://')) return false;
  if (details.url.startsWith('about:')) return false;
  if (details.url.startsWith('data:')) return false;
  if (details.url.startsWith('blob:')) return false;
  if (details.url.startsWith('filesystem:')) return false;
  return true;
}

// ----------------------------------------
// 提取请求体
// ----------------------------------------
function extractRequestBody(requestBody) {
  if (!requestBody) return null;

  if (requestBody.formData) {
    const fd = {};
    for (const [key, values] of Object.entries(requestBody.formData)) {
      fd[key] = values.length === 1 ? values[0] : values;
    }
    const params = new URLSearchParams();
    for (const [key, values] of Object.entries(requestBody.formData)) {
      const arr = Array.isArray(values) ? values : [values];
      for (const v of arr) params.append(key, v);
    }

    // 检查是否同时有 raw 数据（multipart/form-data 场景）
    let rawBody = '';
    let hasFile = false;
    if (requestBody.raw && requestBody.raw.length > 0) {
      try {
        const decoder = new TextDecoder('utf-8');
        for (const item of requestBody.raw) {
          if (item.bytes) {
            rawBody += decoder.decode(item.bytes, { stream: true });
          } else if (item.file) {
            hasFile = true;
          }
        }
        rawBody += decoder.decode();
      } catch (e) {}
    }

    // 如果有 raw body（multipart），优先使用 raw
    if (rawBody) {
      return {
        type: 'formData',
        data: fd,
        raw: rawBody,
        isMultipart: true,
        hasFile
      };
    }

    return { type: 'formData', data: fd, raw: params.toString() };
  }

  if (requestBody.raw && requestBody.raw.length > 0) {
    try {
      const decoder = new TextDecoder('utf-8');
      let rawStr = '';
      let hasFile = false;

      for (const item of requestBody.raw) {
        // item 是 UploadData: { bytes?: ArrayBuffer, file?: string }
        if (item.bytes) {
          rawStr += decoder.decode(item.bytes, { stream: true });
        } else if (item.file) {
          hasFile = true;
          rawStr += '[File: ' + item.file + ']';
        }
      }

      // 刷新解码器（处理多字节字符边界）
      rawStr += decoder.decode();

      if (rawStr) {
        return { type: hasFile ? 'mixed' : 'raw', data: rawStr, raw: rawStr };
      }
    } catch (e) {
      console.warn('extractRequestBody decode error:', e);
      return { type: 'raw', data: '[binary data]', raw: '' };
    }
  }

  return null;
}

// ----------------------------------------
// 格式化请求头
// ----------------------------------------
function formatHeaders(headers) {
  if (!headers) return [];
  return headers
    .filter(h => !h.name.startsWith(':'))
    .map(h => ({ key: h.name, value: h.value }));
}

// ----------------------------------------
// 解析URL
// ----------------------------------------
function parseUrl(url) {
  try {
    const u = new URL(url);
    return {
      raw: url,
      protocol: u.protocol.replace(':', ''),
      host: u.hostname.split('.'),
      port: u.port || '',
      path: u.pathname.split('/').filter(Boolean),
      query: [...u.searchParams.entries()].map(([key, value]) => ({ key, value })),
      variable: []  // Postman v2.1 兼容
    };
  } catch (e) {
    return { raw: url };
  }
}

// ----------------------------------------
// pending entry 创建辅助 (防竞态)
// ----------------------------------------
function createPendingEntry(details) {
  return {
    id: ++requestIdCounter,
    url: details.url,
    method: details.method,
    type: details.type,
    tabId: details.tabId,
    timestamp: details.timeStamp,
    requestBody: null,
    requestHeaders: [],
    responseHeaders: [],
    statusCode: 0,
    statusLine: '',
    error: null,
    redirected: false,
    redirectChain: [],
    _createdAt: Date.now()
  };
}

function attachRecentClickToEntry(entry) {
  if (!entry || entry.traceId) return;
  const clickTrace = findMatchingClickTrace(entry.tabId, entry.timestamp || Date.now());
  if (!clickTrace) return;
  entry.traceId = clickTrace.traceId;
  entry.traceSequence = clickTrace.sequence;
  entry.triggerInfo = clickTrace.triggerInfo;
  entry.triggerDelay = Math.max(0, Math.round((entry.timestamp || Date.now()) - clickTrace.clickTime));
  if (!entry.pageTitle && clickTrace.pageTitle) entry.pageTitle = clickTrace.pageTitle;
  if (!entry.pageUrl && clickTrace.pageUrl) entry.pageUrl = clickTrace.pageUrl;
}

// ----------------------------------------
// WebRequest 事件处理 (所有handler都有竞态守卫)
// ----------------------------------------

function handleBeforeRequest(details) {
  if (!isCapturing) return;
  if (!shouldCapture(details)) return;

  // 重定向: 同 requestId 已存在则更新 URL 链
  if (pendingRequests.has(details.requestId)) {
    const existing = pendingRequests.get(details.requestId);
    existing.redirectChain.push(existing.url);
    existing.url = details.url;
    existing.redirected = true;
    return;
  }

  const entry = createPendingEntry(details);
  // 在 onBeforeRequest 中提取 requestBody (MV3 中唯一可用位置)
  if (details.requestBody) {
    entry.requestBody = extractRequestBody(details.requestBody);
  }
  attachRecentClickToEntry(entry);
  pendingRequests.set(details.requestId, entry);
}

function handleBeforeSendHeaders(details) {
  if (!isCapturing) return;

  // 竞态守卫: entry 可能还没创建
  if (!pendingRequests.has(details.requestId)) {
    pendingRequests.set(details.requestId, createPendingEntry(details));
  }

  const pending = pendingRequests.get(details.requestId);
  pending.requestHeaders = formatHeaders(details.requestHeaders);
  attachRecentClickToEntry(pending);
  // onBeforeSendHeaders 不提供 requestBody（MV3 限制），已在 onBeforeRequest 中捕获
}

function handleHeadersReceived(details) {
  if (!isCapturing) return;

  // 竞态守卫
  if (!pendingRequests.has(details.requestId)) {
    pendingRequests.set(details.requestId, createPendingEntry(details));
  }

  const pending = pendingRequests.get(details.requestId);
  pending.statusCode = details.statusCode || pending.statusCode;
  pending.statusLine = details.statusLine || pending.statusLine;
  pending.responseHeaders = formatHeaders(details.responseHeaders);
  attachRecentClickToEntry(pending);
}

function handleCompleted(details) {
  if (!isCapturing) return;
  const pending = pendingRequests.get(details.requestId);
  if (pending) {
    pending.statusCode = details.statusCode || pending.statusCode;
    pending.duration = Date.now() - (pending._createdAt || Date.now());
    finalizeRequest(pending);
    pendingRequests.delete(details.requestId);
  }
}

function handleError(details) {
  if (!isCapturing) return;
  const pending = pendingRequests.get(details.requestId);
  if (pending) {
    pending.error = details.error || 'Unknown error';
    pending.duration = Date.now() - (pending._createdAt || Date.now());
    finalizeRequest(pending);
    pendingRequests.delete(details.requestId);
  }
}

function recordUserClick(tabId, data) {
  if (tabId == null || !data || !data.triggerInfo) return;
  const now = Date.now();
  const trace = {
    traceId: data.traceId || ('C' + now),
    triggerInfo: data.triggerInfo,
    clickTime: data.clickTime || now,
    createdAt: data.clickTime || now,
    lastRequestAt: data.clickTime || now,
    pageTitle: data.pageTitle || '',
    pageUrl: data.pageUrl || '',
    sequence: 0
  };
  storeClickTrace(tabId, trace);
  if (activeTabId != null && activeTabId !== tabId) {
    storeClickTrace(activeTabId, { ...trace });
  }
}

function storeClickTrace(tabId, trace) {
  const now = Date.now();
  const list = clickTraceMap.get(tabId) || [];
  list.push(trace);
  const fresh = list
    .filter(t => now - t.createdAt < CLICK_TRACE_TTL_MS)
    .slice(-5);
  clickTraceMap.set(tabId, fresh);
}

function findMatchingClickTrace(tabId, requestTime) {
  const candidateTabIds = [];
  if (tabId != null && tabId >= 0) candidateTabIds.push(tabId);
  if (activeTabId != null && !candidateTabIds.includes(activeTabId)) candidateTabIds.push(activeTabId);
  if (candidateTabIds.length === 0) {
    for (const candidateTabId of clickTraceMap.keys()) candidateTabIds.push(candidateTabId);
  }

  let best = null;
  let bestTabId = null;
  let bestAge = Infinity;
  for (const candidateTabId of candidateTabIds) {
    const trace = findMatchingClickTraceInTab(candidateTabId, requestTime);
    if (!trace) continue;
    const age = Math.abs((requestTime || Date.now()) - trace.clickTime);
    if (age < bestAge) {
      best = trace;
      bestTabId = candidateTabId;
      bestAge = age;
    }
  }

  if (best && bestTabId != null) {
    best.lastRequestAt = requestTime || Date.now();
    best.sequence += 1;
  }
  return best;
}

function findMatchingClickTraceInTab(tabId, requestTime) {
  const traces = clickTraceMap.get(tabId);
  if (!traces || traces.length === 0) return null;

  const now = requestTime || Date.now();
  const fresh = traces.filter(t => {
    return (now - t.createdAt >= 0) &&
      (now - t.createdAt < CLICK_TRACE_TTL_MS) &&
      (now - t.lastRequestAt < CLICK_TRACE_GAP_MS);
  });
  clickTraceMap.set(tabId, fresh);

  for (let i = fresh.length - 1; i >= 0; i--) {
    const trace = fresh[i];
    if ((now - trace.createdAt < CLICK_TRACE_TTL_MS) && (now - trace.lastRequestAt < CLICK_TRACE_GAP_MS)) {
      return trace;
    }
  }
  return null;
}

// ----------------------------------------
// 完成请求
// ----------------------------------------
function finalizeRequest(data) {
  if (!isCapturing) return;

  const request = {
    id: data.id,
    url: data.url,
    method: data.method,
    type: data.type,
    tabId: data.tabId,
    timestamp: data.timestamp,
    time: formatTimestamp(data.timestamp),
    statusCode: data.statusCode || 0,
    statusLine: data.statusLine || '',
    requestHeaders: data.requestHeaders || [],
    responseHeaders: data.responseHeaders || [],
    requestBody: data.requestBody,
    pageTitle: data.pageTitle || '',
    pageUrl: data.pageUrl || '',
    triggerInfo: data.triggerInfo || null,
    triggerDelay: data.triggerDelay || null,
    traceId: data.traceId || null,
    traceSequence: data.traceSequence || null,
    duration: data.duration || null,
    error: data.error || null,
    redirected: data.redirected || false,
    redirectChain: data.redirectChain || [],
    parsedUrl: parseUrl(data.url)
  };

  // 补充请求头和请求体 (content script 捕获, 弥补 webRequest 可能缺失的数据)
  // 在时间窗口内查找最接近的 content script 捕获记录
  const prefixKey = request.url + '|' + request.method;
  let bestMatch = null;
  let bestMatchKey = null;
  let bestDiff = Infinity;
  for (const [key, val] of capturedRequestsMap) {
    if (key.startsWith(prefixKey)) {
      const diff = Math.abs(val.time - data.timestamp);
      if (diff < bestDiff && diff < 5000) { // 5秒窗口
        bestDiff = diff;
        bestMatch = val;
        bestMatchKey = key;
      }
    }
  }
  if (bestMatch) {
    if (bestMatch.headers && bestMatch.headers.length > 0) {
      if (!request.requestHeaders || request.requestHeaders.length === 0) {
        request.requestHeaders = bestMatch.headers;
      }
    }
    if (bestMatch.body && !request.requestBody) {
      request.requestBody = { type: 'raw', data: bestMatch.body, raw: bestMatch.body };
    }
    // 合并页面上下文
    if (bestMatch.pageTitle) request.pageTitle = bestMatch.pageTitle;
    if (bestMatch.pageUrl) request.pageUrl = bestMatch.pageUrl;
    // 合并触发来源信息
    if (bestMatch.triggerInfo) {
      request.triggerInfo = bestMatch.triggerInfo;
      request.triggerDelay = bestMatch.triggerDelay;
    }
    // 合并调用链追踪信息
    if (bestMatch.traceId && !request.traceId) {
      request.traceId = bestMatch.traceId;
      request.traceSequence = bestMatch.traceSequence;
    }
    // 匹配成功后立即删除，防止错配
    if (bestMatchKey) capturedRequestsMap.delete(bestMatchKey);
  }

  // 如果 bestMatch 没有提供上下文，从 tabContextMap 兜底
  if (!request.pageTitle || !request.pageUrl) {
    const tabCtx = tabContextMap.get(data.tabId);
    if (tabCtx) {
      if (!request.pageTitle) request.pageTitle = tabCtx.pageTitle;
      if (!request.pageUrl) request.pageUrl = tabCtx.pageUrl;
    }
  }

  // webRequest-only fallback: script/image/navigation requests do not pass through
  // fetch/XHR interception, so attach the nearest recent click from the same tab.
  if (!request.traceId) {
    const clickTrace = findMatchingClickTrace(data.tabId, data.timestamp || Date.now());
    if (clickTrace) {
      request.traceId = clickTrace.traceId;
      request.traceSequence = clickTrace.sequence;
      request.triggerInfo = clickTrace.triggerInfo;
      request.triggerDelay = Math.max(0, Math.round((data.timestamp || Date.now()) - clickTrace.clickTime));
      if (!request.pageTitle && clickTrace.pageTitle) request.pageTitle = clickTrace.pageTitle;
      if (!request.pageUrl && clickTrace.pageUrl) request.pageUrl = clickTrace.pageUrl;
    }
  }

  capturedRequests.push(request);

  if (capturedRequests.length > MAX_REQUESTS) {
    // 保留异常请求（4xx/5xx/错误）和有触发来源的请求不被截断
    // 单次遍历 O(n)，不排序，保持插入顺序
    const overflow = capturedRequests.length - MAX_REQUESTS;
    let removed = 0;
    const newArray = [];
    for (const r of capturedRequests) {
      if (r.error || (r.statusCode >= 400) || r.triggerInfo || r.traceId) {
        newArray.push(r);
      } else if (removed < overflow) {
        removed++;
      } else {
        newArray.push(r);
      }
    }
    // 如果正常请求不够删，从尾部丢弃优先级最低的
    if (newArray.length > MAX_REQUESTS) {
      capturedRequests = newArray.slice(newArray.length - MAX_REQUESTS);
    } else {
      capturedRequests = newArray;
    }
  }

  updateBadge();
  debouncedSave();

  // 流式推送: 将新请求实时推送到 popup
  pushNewRequest(request);
}

// ----------------------------------------
// 清理过期 pending 条目
// ----------------------------------------
function cleanupStaleEntries() {
  const now = Date.now();
  let cleaned = 0;
  for (const [requestId, entry] of pendingRequests.entries()) {
    if (now - entry._createdAt > STALE_ENTRY_TTL_MS) {
      finalizeRequest(entry);
      pendingRequests.delete(requestId);
      cleaned++;
    }
  }
}

function ensureAlarm() {
  chrome.alarms.get('cleanupPending', (alarm) => {
    if (!alarm) {
      chrome.alarms.create('cleanupPending', { periodInMinutes: 0.5 });
    }
  });
}

// ----------------------------------------
// 监听器注册
// ----------------------------------------
let listenersRegistered = false;

function registerListeners() {
  if (listenersRegistered) return;

  chrome.webRequest.onBeforeRequest.addListener(
    handleBeforeRequest,
    { urls: ['<all_urls>'] },
    ['requestBody']
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    handleBeforeSendHeaders,
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );

  chrome.webRequest.onHeadersReceived.addListener(
    handleHeadersReceived,
    { urls: ['<all_urls>'] },
    ['responseHeaders', 'extraHeaders']
  );

  chrome.webRequest.onCompleted.addListener(
    handleCompleted,
    { urls: ['<all_urls>'] }
  );

  chrome.webRequest.onErrorOccurred.addListener(
    handleError,
    { urls: ['<all_urls>'] }
  );

  listenersRegistered = true;
}

function unregisterListeners() {
  chrome.webRequest.onBeforeRequest.removeListener(handleBeforeRequest);
  chrome.webRequest.onBeforeSendHeaders.removeListener(handleBeforeSendHeaders);
  chrome.webRequest.onHeadersReceived.removeListener(handleHeadersReceived);
  chrome.webRequest.onCompleted.removeListener(handleCompleted);
  chrome.webRequest.onErrorOccurred.removeListener(handleError);
  listenersRegistered = false;
  clearTransientCaptureState();
}

// ----------------------------------------
// 导出: Postman Collection v2.1
// ----------------------------------------
function generatePostmanCollection(ids) {
  const items = getExportItems(ids);

  return JSON.stringify({
    info: {
      name: `HTTP Requests - ${new Date().toLocaleString()}`,
      description: chrome.i18n.getMessage('extDescription') || 'Exported by HTTP Request Capture',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: items.map(req => createPostmanItem(req))
  }, null, 2);
}

function getExportItems(ids) {
  return (ids && ids.length > 0)
    ? capturedRequests.filter(r => ids.includes(r.id))
    : capturedRequests;
}

function getExportSummary(ids) {
  const items = getExportItems(ids);
  const methodCounts = {};
  const domains = new Set();
  let errorCount = 0;

  for (const r of items) {
    const method = (r.method || 'GET').toUpperCase();
    methodCounts[method] = (methodCounts[method] || 0) + 1;
    try {
      domains.add(new URL(r.url).hostname);
    } catch (e) {
      domains.add(r.url || 'unknown');
    }
    if (r.statusCode >= 400 || r.error) errorCount++;
  }

  return {
    requestCount: items.length,
    domainCount: domains.size,
    methodCounts,
    errorCount
  };
}

function createPostmanItem(req) {
  const urlObj = req.parsedUrl;
  const pathStr = urlObj.path ? '/' + urlObj.path.join('/') : '';

  const item = {
    name: `${req.method} ${pathStr || urlObj.raw}`,
    request: {
      method: req.method,
      header: req.requestHeaders.map(h => ({
        key: h.key,
        value: h.value,
        type: 'text'
      })),
      url: urlObj
    },
    response: []
  };

  if (req.requestBody && req.requestBody.data) {
    const contentType = req.requestHeaders.find(
      h => h.key.toLowerCase() === 'content-type'
    );
    const ctValue = contentType ? contentType.value.toLowerCase() : '';

    if (req.requestBody.type === 'formData') {
      // 根据 Content-Type 区分 urlencoded 和 multipart
      if (ctValue.includes('multipart') || req.requestBody.isMultipart) {
        item.request.body = {
          mode: 'formdata',
          formdata: Object.entries(req.requestBody.data || {}).flatMap(([key, value]) => {
            const values = Array.isArray(value) ? value : [value];
            return values.map(v => ({
              key,
              value: String(v),
              type: 'text'
            }));
          })
        };
      } else {
        item.request.body = {
          mode: 'urlencoded',
          urlencoded: Object.entries(req.requestBody.data || {}).flatMap(([key, value]) => {
            const values = Array.isArray(value) ? value : [value];
            return values.map(v => ({
              key,
              value: String(v),
              type: 'text'
            }));
          })
        };
      }
    } else if (ctValue.includes('json')) {
      item.request.body = {
        mode: 'raw',
        raw: req.requestBody.data,
        options: { raw: { language: 'json' } }
      };
    } else if (ctValue.includes('xml')) {
      item.request.body = {
        mode: 'raw',
        raw: req.requestBody.data,
        options: { raw: { language: 'xml' } }
      };
    } else if (ctValue.includes('html')) {
      item.request.body = {
        mode: 'raw',
        raw: req.requestBody.data,
        options: { raw: { language: 'html' } }
      };
    } else {
      item.request.body = {
        mode: 'raw',
        raw: req.requestBody.data
      };
    }
  }

  return item;
}

// ----------------------------------------
// 导出: HAR 1.2
// ----------------------------------------
function generateHar(ids) {
  const entries = getExportItems(ids);

  return JSON.stringify({
    log: {
      version: '1.2',
      creator: {
        name: 'HTTP Request Capture',
        version: '1.0.0'
      },
      entries: entries.map(reqToHarEntry)
    }
  }, null, 2);
}

function findHeader(headers, key) {
  if (!headers) return null;
  const found = headers.find(h => h.key.toLowerCase() === key.toLowerCase());
  return found ? found.value : null;
}

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return [];
  return cookieHeader.split(';').map(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return null;
    const name = pair.substring(0, idx).trim();
    const value = pair.substring(idx + 1).trim();
    return { name, value };
  }).filter(Boolean);
}

function parseSetCookieHeaders(headers) {
  if (!headers) return [];
  // 收集所有 Set-Cookie 头
  const setCookies = headers
    .filter(h => h.key.toLowerCase() === 'set-cookie')
    .map(h => h.value);

  return setCookies.map(cookieStr => {
    const parts = cookieStr.split(';').map(s => s.trim());
    const mainPart = parts[0];
    const idx = mainPart.indexOf('=');
    if (idx === -1) return null;

    const name = mainPart.substring(0, idx).trim();
    const value = mainPart.substring(idx + 1).trim();

    const cookie = { name, value };

    // 解析属性
    for (let i = 1; i < parts.length; i++) {
      const attr = parts[i];
      const eqIdx = attr.indexOf('=');
      if (eqIdx === -1) {
        const attrName = attr.toLowerCase();
        if (attrName === 'httponly') cookie.httpOnly = true;
        else if (attrName === 'secure') cookie.secure = true;
      } else {
        const attrName = attr.substring(0, eqIdx).trim().toLowerCase();
        const attrValue = attr.substring(eqIdx + 1).trim();
        if (attrName === 'path') cookie.path = attrValue;
        else if (attrName === 'domain') cookie.domain = attrValue;
        else if (attrName === 'expires') cookie.expires = attrValue;
        else if (attrName === 'max-age') cookie.maxAge = attrValue;
      }
    }

    return cookie;
  }).filter(Boolean);
}

function reqToHarEntry(req) {
  const startedDateTime = new Date(req.timestamp).toISOString();
  const bodySize = req.requestBody
    ? new Blob([typeof req.requestBody.data === 'string' ? req.requestBody.data : '']).size
    : -1;

  const cookieHeader = findHeader(req.requestHeaders, 'cookie');

  const entry = {
    startedDateTime,
    time: 0,
    request: {
      method: req.method,
      url: req.url,
      httpVersion: 'HTTP/1.1',
      cookies: parseCookieHeader(cookieHeader),
      headers: (req.requestHeaders || []).map(h => ({ name: h.key, value: h.value })),
      queryString: (req.parsedUrl?.query || []).map(q => ({ name: q.key, value: q.value })),
      headersSize: -1,
      bodySize: bodySize
    },
    response: {
      status: req.statusCode || 0,
      statusText: req.statusLine || '',
      httpVersion: 'HTTP/1.1',
      cookies: parseSetCookieHeaders(req.responseHeaders),
      headers: (req.responseHeaders || []).map(h => ({ name: h.key, value: h.value })),
      content: {
        size: -1,
        mimeType: findHeader(req.responseHeaders, 'content-type') || ''
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: -1
    },
    cache: {},
    timings: {
      send: 0,
      wait: 0,
      receive: 0
    }
  };

  // postData
  if (req.requestBody && req.requestBody.data) {
    const mimeType = findHeader(req.requestHeaders, 'content-type') || 'application/octet-stream';
    entry.request.postData = {
      mimeType,
      text: typeof req.requestBody.data === 'string'
        ? req.requestBody.data
        : JSON.stringify(req.requestBody.data)
    };
  }

  return entry;
}

// ----------------------------------------
// 下载文件 (通用)
// ----------------------------------------
function downloadJson(json, filename) {
  return downloadBlob(json, filename, 'application/json');
}

function downloadBlob(data, filename, mimeType) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([data], { type: mimeType });
      const reader = new FileReader();
      reader.onload = () => {
        chrome.downloads.download({
          url: reader.result,
          filename,
          saveAs: true
        }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    } catch (e) {
      reject(e);
    }
  });
}

// ----------------------------------------
// Newman CI 导出: 生成脚本 + 打包 zip
// ----------------------------------------
function generateNewmanScripts(collectionJson) {
  const shScript = `#!/bin/bash
# Newman CI Runner - Generated by HTTP Request Capture
# Usage: ./run-newman.sh [newman-options]

set -e

# Check newman
if ! command -v newman &> /dev/null; then
  echo "Error: newman is not installed."
  echo "Install: npm install -g newman"
  exit 1
fi

echo "Running Newman tests..."
newman run collection.json \\
  --reporters cli,junit \\
  --reporter-junit-export results.xml \\
  --timeout-request 30000 \\
  "$@"
echo "Done. Results: results.xml"
`;

  const batScript = `@echo off
REM Newman CI Runner - Generated by HTTP Request Capture
REM Usage: run-newman.bat

where newman >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: newman is not installed.
  echo Install: npm install -g newman
  exit /b 1
)

echo Running Newman tests...
newman run collection.json ^
  --reporters cli,junit ^
  --reporter-junit-export results.xml ^
  --timeout-request 30000
echo Done.
`;

  const readme = `# Newman CI Runner

Generated by HTTP Request Capture extension on ${new Date().toLocaleString()}.

## Prerequisites

Install Newman: \`npm install -g newman\`

## Usage

### Unix/Mac:
  ./run-newman.sh

### Windows:
  run-newman.bat

## CI Integration

### GitHub Actions
\`\`\`yaml
- name: API Tests
  run: |
    npm install -g newman
    ./run-newman.sh
\`\`\`

### GitLab CI
\`\`\`yaml
api-tests:
  script:
    - npm install -g newman
    - ./run-newman.sh
  artifacts:
    reports:
      junit: results.xml
\`\`\`

### Jenkins
  sh './run-newman.sh'

## Output

- \`results.xml\` — JUnit test report (for CI integration)
- Console output with test results
`;

  return { sh: shScript, bat: batScript, readme };
}

function createZipBlob(files) {
  // Minimal ZIP builder (store method, no compression)
  const encoder = new TextEncoder();
  const localHeaders = [];
  const centralEntries = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBytes = encoder.encode(name);
    const dataBytes = typeof data === 'string' ? encoder.encode(data) : data;
    const crc = crc32(dataBytes);

    const localLen = 30 + nameBytes.length + dataBytes.length;
    const local = new Uint8Array(localLen);
    local[0] = 0x50; local[1] = 0x4b; local[2] = 0x03; local[3] = 0x04; // sig
    local[4] = 20; local[5] = 0;  // version
    local[8] = 0; local[9] = 0;   // store
    local[14] = crc & 0xff; local[15] = (crc >> 8) & 0xff;
    local[16] = (crc >> 16) & 0xff; local[17] = (crc >> 24) & 0xff;
    // compressed size = uncompressed size (store)
    local[18] = dataBytes.length & 0xff; local[19] = (dataBytes.length >> 8) & 0xff;
    local[20] = (dataBytes.length >> 16) & 0xff; local[21] = (dataBytes.length >> 24) & 0xff;
    local[22] = dataBytes.length & 0xff; local[23] = (dataBytes.length >> 8) & 0xff;
    local[24] = (dataBytes.length >> 16) & 0xff; local[25] = (dataBytes.length >> 24) & 0xff;
    local[26] = nameBytes.length & 0xff; local[27] = (nameBytes.length >> 8) & 0xff;
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    localHeaders.push(local);
    centralEntries.push({ nameBytes, dataBytes, localHeaderOffset: offset, crc });
    offset += localLen;
  }

  const centralParts = [];
  for (const e of centralEntries) {
    const c = new Uint8Array(46 + e.nameBytes.length);
    c[0] = 0x50; c[1] = 0x4b; c[2] = 0x01; c[3] = 0x02; // sig
    c[4] = 20; c[10] = 0; c[11] = 0; // store
    c[16] = e.crc & 0xff; c[17] = (e.crc >> 8) & 0xff;
    c[18] = (e.crc >> 16) & 0xff; c[19] = (e.crc >> 24) & 0xff;
    c[20] = e.dataBytes.length & 0xff; c[21] = (e.dataBytes.length >> 8) & 0xff;
    c[22] = (e.dataBytes.length >> 16) & 0xff; c[23] = (e.dataBytes.length >> 24) & 0xff;
    c[24] = e.dataBytes.length & 0xff; c[25] = (e.dataBytes.length >> 8) & 0xff;
    c[26] = (e.dataBytes.length >> 16) & 0xff; c[27] = (e.dataBytes.length >> 24) & 0xff;
    c[28] = e.nameBytes.length & 0xff; c[29] = (e.nameBytes.length >> 8) & 0xff;
    c[42] = e.localHeaderOffset & 0xff; c[43] = (e.localHeaderOffset >> 8) & 0xff;
    c[44] = (e.localHeaderOffset >> 16) & 0xff; c[45] = (e.localHeaderOffset >> 24) & 0xff;
    c.set(e.nameBytes, 46);
    centralParts.push(c);
  }

  const centralDir = new Uint8Array(centralParts.reduce((s, p) => s + p.length, 0));
  let pos = 0;
  for (const p of centralParts) { centralDir.set(p, pos); pos += p.length; }

  const eocd = new Uint8Array(22);
  eocd[0] = 0x50; eocd[1] = 0x4b; eocd[2] = 0x05; eocd[3] = 0x06;
  eocd[8] = centralParts.length & 0xff; eocd[9] = (centralParts.length >> 8) & 0xff;
  eocd[10] = centralParts.length & 0xff; eocd[11] = (centralParts.length >> 8) & 0xff;
  eocd[12] = centralDir.length & 0xff; eocd[13] = (centralDir.length >> 8) & 0xff;
  eocd[14] = (centralDir.length >> 16) & 0xff; eocd[15] = (centralDir.length >> 24) & 0xff;
  eocd[16] = offset & 0xff; eocd[17] = (offset >> 8) & 0xff;
  eocd[18] = (offset >> 16) & 0xff; eocd[19] = (offset >> 24) & 0xff;

  const totalLen = localHeaders.reduce((s, h) => s + h.length, 0) + centralDir.length + eocd.length;
  const buf = new Uint8Array(totalLen);
  pos = 0;
  for (const h of localHeaders) { buf.set(h, pos); pos += h.length; }
  buf.set(centralDir, pos); pos += centralDir.length;
  buf.set(eocd, pos);

  return new Blob([buf], { type: 'application/zip' });
}

function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = (c >>> 8) ^ crc32Table[(c ^ data[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}
const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

// ----------------------------------------
// 消息处理
// ----------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 全局守卫：已停止时丢弃所有来自 content script 的数据注入
  if (!isCapturing && message.type && (
    message.type === 'CAPTURED_REQUEST' ||
    message.type === 'PAGE_CONTEXT' ||
    message.type === 'USER_CLICK'
  )) {
    return false; // 拦截并丢弃
  }

  switch (message.type) {
    case 'INJECT_MAIN_WORLD': {
      if (!sender.tab || sender.tab.id == null || typeof chrome.scripting === 'undefined') {
        sendResponse({ success: false });
        break;
      }

      const target = { tabId: sender.tab.id };
      if (typeof sender.frameId === 'number' && sender.frameId >= 0) {
        target.frameIds = [sender.frameId];
      }

      chrome.scripting.executeScript({
        target,
        files: ['injected.js'],
        world: 'MAIN',
        injectImmediately: true
      }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        sendResponse({ success: true });
      });
      return true;
    }

    case 'GET_STATE':
      if (stateLoaded) {
        sendResponse({
          isCapturing,
          total: capturedRequests.length,
          requests: capturedRequests.slice(-POPUP_BATCH_SIZE)
        });
      } else {
        // 状态尚未加载完成，加入等待队列（保持通道开放）
        stateLoadedCallbacks.push(() => {
          sendResponse({
            isCapturing,
            total: capturedRequests.length,
            requests: capturedRequests.slice(-POPUP_BATCH_SIZE)
          });
        });
        return true; // 异步响应
      }
      break;

    case 'START':
      if (!isCapturing) {
        isCapturing = true;
        saveSessionState(); // 持久化到 session storage（跨 SW 重启保留）
        activeTabId = message.tabId || null;
        registerListeners();
        ensureAlarm();
        saveCoreState();
        notifyPortsStateUpdate();
        sendResponse({ success: true, isCapturing });
        debouncedSave();
      } else {
        sendResponse({ success: true, isCapturing });
      }
      break;

    case 'STOP':
      if (isCapturing) {
        isCapturing = false;
        saveSessionState(); // 持久化到 session storage
        unregisterListeners();
        notifyPortsStateUpdate();
        sendResponse({ success: true, isCapturing });
        cancelPendingSave();
        saveState();
      } else {
        sendResponse({ success: true, isCapturing });
      }
      break;

    case 'CLEAR':
      clearAllCapturedState(() => {
        notifyPortsStateUpdate();
        sendResponse({ success: true, total: 0, requests: [] });
      });
      return true;

    case 'CLEAR_DOMAIN': {
      const domain = message.domain || '';
      if (!domain) {
        sendResponse({ success: false, error: '缺少域名' });
        break;
      }
      removePendingRequestsByDomain(domain);
      capturedRequests = capturedRequests.filter(r => {
        try {
          return new URL(r.url).hostname !== domain;
        } catch (e) {
          return r.url !== domain;
        }
      });
      updateBadge();
      saveState();
      sendResponse({
        success: true,
        total: capturedRequests.length,
        requests: capturedRequests.slice(-POPUP_BATCH_SIZE)
      });
      break;
    }

    case 'SET_REQUESTS': {
      cancelPendingSave();
      capturedRequests.length = 0;
      if (message.requests) {
        capturedRequests.push(...message.requests);
      }
      updateBadge();
      saveState();
      sendResponse({ success: true });
      break;
    }

    case 'EXPORT': {
      const json = generatePostmanCollection(message.ids);
      const filename = `postman-collection-${Date.now()}.json`;
      const summary = getExportSummary(message.ids);
      downloadJson(json, filename)
        .then(() => sendResponse({ success: true, summary }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // 异步
    }

    case 'EXPORT_HAR': {
      const har = generateHar(message.ids);
      const filename = `har-export-${Date.now()}.har`;
      const summary = getExportSummary(message.ids);
      downloadJson(har, filename)
        .then(() => sendResponse({ success: true, summary }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // 异步
    }

    case 'EXPORT_NEWMAN': {
      try {
        const collectionJson = generatePostmanCollection(message.ids);
        const scripts = generateNewmanScripts(collectionJson);
        const timestamp = Date.now();
        const summary = getExportSummary(message.ids);
        const zipBlob = createZipBlob([
          { name: 'collection.json', data: collectionJson },
          { name: 'run-newman.sh', data: scripts.sh },
          { name: 'run-newman.bat', data: scripts.bat },
          { name: 'README.md', data: scripts.readme }
        ]);
        downloadBlob(zipBlob, `newman-ci-${timestamp}.zip`, 'application/zip')
          .then(() => sendResponse({ success: true, summary }))
          .catch(err => sendResponse({ success: false, error: err.message }));
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
      return true; // 异步
    }

    case 'GET_REQUEST_DETAIL': {
      const req = capturedRequests.find(r => r.id === message.id);
      sendResponse({ request: req || null });
      break;
    }

    case 'SAVE_PROXY_TARGET': {
      proxyTarget = message.target || '';
      proxyPathFrom = message.pathFrom || '';
      proxyPathTo = message.pathTo || '';
      proxyCustomCookie = message.customCookie || '';
      saveState();
      sendResponse({ success: true });
      break;
    }

    case 'GET_PROXY_TARGET': {
      sendResponse({
        target: proxyTarget,
        pathFrom: proxyPathFrom,
        pathTo: proxyPathTo,
        customCookie: proxyCustomCookie
      });
      break;
    }

    case 'SYNC_POSTMAN': {
      try {
        const apiKey = message.apiKey || postmanApiKey;
        if (!apiKey) {
          sendResponse({ success: false, error: '缺少 Postman API Key' });
          break;
        }

        // 更新保存的 key
        if (message.apiKey) postmanApiKey = message.apiKey;
        if (message.workspace) postmanWorkspace = message.workspace;

        // 生成集合 JSON
        const ids = message.ids || [];
        const collectionJson = JSON.parse(generatePostmanCollection(ids));
        // 使用自定义名称或默认名称
        if (message.collectionName) {
          collectionJson.info.name = message.collectionName;
        }

        // 包裹为 Postman API 格式
        const postBody = JSON.stringify({ collection: collectionJson });

        // 构建 API URL（分离 base URL 和 workspace query 避免拼接错误）
        const baseApiUrl = 'https://api.getpostman.com/collections';
        const workspace = message.workspace || postmanWorkspace;
        const wsQuery = workspace ? '?workspace=' + encodeURIComponent(workspace) : '';

        // 先尝试按名称查找现有集合
        const findAndUpdate = () => {
          return fetch(baseApiUrl + wsQuery, {
            headers: { 'X-Api-Key': apiKey }
          })
          .then(res => res.json())
          .then(data => {
            if (data && data.collections) {
              const existing = data.collections.find(
                c => c.name === collectionJson.info.name
              );
              if (existing) {
                // 更新已有集合
                return fetch(baseApiUrl + '/' + existing.uid + wsQuery, {
                  method: 'PUT',
                  headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                  },
                  body: postBody
                }).then(r => r.json());
              }
            }
            // 创建新集合
            return fetch(baseApiUrl + wsQuery, {
              method: 'POST',
              headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
              },
              body: postBody
            }).then(r => r.json());
          });
        };

        findAndUpdate().then(result => {
          if (result && (result.collection || result.collections)) {
            saveState();
            sendResponse({ success: true, name: collectionJson.info.name });
          } else {
            const rawMsg = JSON.stringify(result);
            const errMsg = result?.error?.message || result?.message || (rawMsg.length > 200 ? rawMsg.substring(0, 200) + '...' : rawMsg);
            sendResponse({ success: false, error: 'Postman API 错误: ' + errMsg });
          }
        }).catch(err => {
          sendResponse({ success: false, error: '网络错误: ' + err.message });
        });

        return true; // 异步
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
      break;
    }

    case 'CAPTURED_REQUEST': {
      if (!isCapturing) break; // 已停止时不处理 content script 的请求数据
      const { url, method, headers, body } = message.data;
      if (url) {
        // 标准化 headers: content script 发送 {name,value}, 系统内用 {key,value}
        const normalHeaders = (headers || []).map(h => ({ key: h.name, value: h.value }));
        // 用 url+method+时间戳 作为 key，避免并发请求互相覆盖
        const mapKey = url + '|' + (method || 'GET') + '|' + Date.now();
        capturedRequestsMap.set(mapKey, {
          url,
          headers: normalHeaders,
          body: body || '',
          method,
          time: Date.now(),
          pageTitle: message.data.pageTitle || '',
          pageUrl: message.data.pageUrl || '',
          triggerInfo: message.data.triggerInfo || null,
          triggerDelay: message.data.triggerDelay || null,
          traceId: message.data.traceId || null,
          traceSequence: message.data.traceSequence || null,
        });
        // 清理 30 秒前的过期条目
        const now = Date.now();
        for (const [key, val] of capturedRequestsMap) {
          if (now - val.time > 30000) capturedRequestsMap.delete(key);
        }
      }
      break;
    }

    case 'PAGE_CONTEXT': {
      // 存储页面上下文 (来自 content script SPA 导航追踪)
      const senderTabId = sender.tab ? sender.tab.id : null;
      if (senderTabId && message.data) {
        tabContextMap.set(senderTabId, {
          pageTitle: message.data.pageTitle || '',
          pageUrl: message.data.pageUrl || '',
          updatedAt: Date.now()
        });
      }
      // 清理 10 分钟未更新的条目
      const staleThreshold = Date.now() - 600000;
      for (const [tabId, ctx] of tabContextMap) {
        if (ctx.updatedAt < staleThreshold) {
          tabContextMap.delete(tabId);
        }
      }
      break;
    }

    case 'USER_CLICK': {
      const senderTabId = sender.tab ? sender.tab.id : null;
      recordUserClick(senderTabId, message.data);
      break;
    }

    case 'REPLAY_REQUEST': {
      if (!proxyTarget) {
        sendResponse({ success: false, error: '尚未配置代理目标地址' });
        break;
      }

      const req = capturedRequests.find(r => r.id === message.id);
      if (!req) {
        sendResponse({ success: false, error: '请求不存在' });
        break;
      }

      // 构建转发 URL: 替换 host，可选路径前缀重写
      let replayUrl;
      try {
        const cleanTarget = proxyTarget.replace(/\/+$/, '');
        const u = new URL(req.url);
        let path = u.pathname;
        // 应用路径前缀重写 (如 /ams/plan → /ams)
        if (proxyPathFrom && path.startsWith(proxyPathFrom)) {
          path = proxyPathTo + path.substring(proxyPathFrom.length);
        }
        replayUrl = cleanTarget + path + u.search;
      } catch (e) {
        sendResponse({ success: false, error: 'URL 解析失败' });
        break;
      }

      // 准备请求头 (过滤掉禁止设置的头部，统一处理大小写避免重复头)
      const headers = {};
      const headerKeys = new Set(); // 跟踪已添加的头（小写）
      const FORBIDDEN_HEADERS = [
        'host', 'content-length', 'origin', 'referer',
        'connection', 'keep-alive', 'transfer-encoding', 'upgrade'
      ];
      if (req.requestHeaders) {
        for (const h of req.requestHeaders) {
          const key = h.key.toLowerCase();
          if (!FORBIDDEN_HEADERS.includes(key) && !key.startsWith(':')) {
            if (headerKeys.has(key)) {
              // 已存在同名字段（不同大小写），覆盖
              for (const existingKey of Object.keys(headers)) {
                if (existingKey.toLowerCase() === key) {
                  headers[existingKey] = h.value;
                  break;
                }
              }
            } else {
              headers[h.key] = h.value;
              headerKeys.add(key);
            }
          }
        }
      }

      // 准备请求体 (根据不同 body 类型正确处理)
      let body = undefined;
      const contentTypeKey = Object.keys(headers).find(k => k.toLowerCase() === 'content-type');
      let finalContentType = contentTypeKey ? headers[contentTypeKey] : '';
      if (req.requestBody && req.requestBody.data) {
        if (req.requestBody.type === 'formData') {
          body = req.requestBody.raw || '';
          if (!finalContentType) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        } else {
          body = typeof req.requestBody.data === 'string'
            ? req.requestBody.data
            : JSON.stringify(req.requestBody.data);
        }
      }

      // 设置自定义 Cookie (通过 chrome.cookies API，fetch 禁止手动设置 Cookie 头)
      const cookieSetupPromise = (() => {
        if (!proxyCustomCookie) return Promise.resolve();
        const pairs = proxyCustomCookie.split(';').map(s => s.trim()).filter(Boolean);
        return Promise.all(pairs.map(pair => {
          const idx = pair.indexOf('=');
          if (idx === -1) return Promise.resolve();
          const name = pair.substring(0, idx).trim();
          const value = pair.substring(idx + 1).trim();
          return new Promise(resolve => {
            try {
              const cookieUrl = new URL(replayUrl);
              chrome.cookies.set({
                url: cookieUrl.origin + cookieUrl.pathname,
                name,
                value,
                path: '/'
              }, resolve);
            } catch(e) { resolve(null); }
          });
        }));
      })();

      // 发起请求 (30s 超时)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      cookieSetupPromise.then(() => {
        fetch(replayUrl, {
          method: req.method,
          headers,
          body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : body,
          signal: controller.signal,
          redirect: 'follow',
          credentials: 'include'
        })
        .then(async (response) => {
          clearTimeout(timeoutId);
          let respBody = '';
          try {
            respBody = await response.text();
            if (respBody.length > 1000) respBody = respBody.substring(0, 1000) + '\n... (响应体已截断)';
          } catch (e) {
            respBody = '[无法读取响应体]';
          }
          sendResponse({
            success: true,
            status: response.status,
            statusText: response.statusText,
            body: respBody
          });
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          const msg = err.name === 'AbortError' ? '请求超时 (30s)' : err.message;
          sendResponse({ success: false, error: msg });
        });
      });

      return true; // 异步响应
    }

    case 'DIAGNOSE':
      chrome.storage.session.get(null, (sessionData) => {
        sendResponse({
          isCapturing,
          stateLoaded,
          loadStateCalled,
          listenersRegistered,
          capturedRequestsCount: capturedRequests.length,
          pendingRequestsCount: pendingRequests.size,
          connectedPortsCount: connectedPorts.size,
          clickTraceTabs: clickTraceMap.size,
          recentClicks: [...clickTraceMap.entries()].map(([tabId, traces]) => ({
            tabId,
            count: traces.length,
            latest: traces[traces.length - 1] || null
          })),
          sessionData
        });
      });
      return true;
  }

  return true; // 保持通道开放
});

// ----------------------------------------
// 流式推送: 管理 popup 长连接
// ----------------------------------------
function pushNewRequest(request) {
  if (connectedPorts.size === 0) return;
  const msg = { type: 'NEW_REQUEST', request };
  for (const port of connectedPorts) {
    try {
      port.postMessage(msg);
    } catch (e) {
      connectedPorts.delete(port);
    }
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'popup') return;

  connectedPorts.add(port);

  // 发送初始状态 — 等待 loadState() 完成后发送，避免竞态
  const sendInit = () => {
    port.postMessage({
      type: 'INIT',
      requests: capturedRequests.slice(-POPUP_BATCH_SIZE),
      total: capturedRequests.length,
      isCapturing
    });
  };

  if (stateLoaded) {
    sendInit();
  } else {
    stateLoadedCallbacks.push(sendInit);
  }

  port.onDisconnect.addListener(() => {
    connectedPorts.delete(port);
  });
});

// 清理 tabContextMap 中已关闭的标签页
chrome.tabs.onRemoved.addListener((tabId) => {
  tabContextMap.delete(tabId);
  clickTraceMap.delete(tabId);
});

// ----------------------------------------
// Alarm 处理
// ----------------------------------------
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupPending') {
    cleanupStaleEntries();
  }
});

// ----------------------------------------
// 初始化
// ----------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  loadState();
  ensureAlarm();
});

loadState();
ensureAlarm();
