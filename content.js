// ============================================================
// HTTP Request Capture - Content Script (Isolated World)
// 加载外部 main-world 脚本拦截 fetch/XHR，并通过 postMessage 转发数据
// ============================================================

var __httpCaptureContextValid = true;

window.addEventListener('error', function(event) {
  if (event && String(event.message || '').includes('Extension context invalidated')) {
    __httpCaptureContextValid = false;
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  }
}, true);

window.addEventListener('unhandledrejection', function(event) {
  var reason = event && event.reason;
  var message = reason && (reason.message || String(reason));
  if (String(message || '').includes('Extension context invalidated')) {
    __httpCaptureContextValid = false;
    event.preventDefault();
  }
});

function safeSendMessage(message) {
  if (!__httpCaptureContextValid) return;
  try {
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
      __httpCaptureContextValid = false;
      return;
    }
    var result = chrome.runtime.sendMessage(message);
    if (result && typeof result.catch === 'function') {
      result.catch(function() {});
    }
  } catch (e) {
    __httpCaptureContextValid = false;
  }
}

function injectMainWorldScript() {
  if (document.documentElement && document.documentElement.dataset.httpCaptureInjected === '1') return;
  if (document.documentElement) {
    document.documentElement.dataset.httpCaptureInjected = '1';
  }

  safeSendMessage({ type: 'INJECT_MAIN_WORLD' });
}

injectMainWorldScript();

if (!window.__HTTP_CAPTURE_ISOLATED_READY__) {
  window.__HTTP_CAPTURE_ISOLATED_READY__ = true;

  // Isolated world fallback: even when main-world injection is blocked or misses
  // a click, report the user action directly from the extension context.
  var __isolatedLastClickTime = 0;
  var __isolatedTraceCounter = 0;

  function findTriggerElementFallback(el) {
    if (!el || !el.tagName) return null;
    var actionableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY', 'OPTION'];
    var current = el;
    for (var i = 0; i < 6; i++) {
      if (!current || !current.tagName) break;
      var tag = current.tagName.toUpperCase();
      if (actionableTags.indexOf(tag) >= 0) return current;
      var role = current.getAttribute('role');
      if (role && ['button', 'link', 'menuitem', 'tab', 'option', 'switch', 'checkbox', 'radio'].indexOf(role) >= 0) return current;
      if (current.getAttribute('tabindex') !== null && current.getAttribute('tabindex') !== '') return current;
      if (current.getAttribute('onclick')) return current;
      current = current.parentElement;
    }
    return el;
  }

  function extractElementInfoFallback(el) {
    if (!el || !el.tagName) return null;
    var tag = el.tagName.toLowerCase();
    var text = '';
    if (el.getAttribute('aria-label')) {
      text = el.getAttribute('aria-label');
    } else if (el.getAttribute('title')) {
      text = el.getAttribute('title');
    } else if (el.alt) {
      text = el.alt;
    } else if (el.textContent) {
      text = el.textContent.trim().replace(/\s+/g, ' ').substring(0, 80);
    } else if (el.value) {
      text = String(el.value).substring(0, 80);
    }

    var selector = '';
    if (el.id) {
      selector = '#' + el.id;
    } else if (el.className && typeof el.className === 'string') {
      var classes = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      selector = classes ? tag + '.' + classes : tag;
    } else {
      selector = tag;
    }

    return {
      tag: tag,
      text: text,
      id: el.id || '',
      className: (typeof el.className === 'string') ? el.className.substring(0, 100) : '',
      href: el.href || '',
      type: el.type || '',
      name: el.name || '',
      role: el.getAttribute('role') || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      title: el.getAttribute('title') || '',
      selector: selector
    };
  }

  function getCurrentPageContextFallback() {
    return {
      pageTitle: document.title || '',
      pageUrl: window.location.href
    };
  }

  document.addEventListener('click', function(e) {
    var now = Date.now();
    if (now - __isolatedLastClickTime < 100) return;
    __isolatedLastClickTime = now;

    var triggerEl = findTriggerElementFallback(e.target || e.srcElement);
    var info = extractElementInfoFallback(triggerEl);
    if (!info) return;

    var ctx = getCurrentPageContextFallback();
    safeSendMessage({
      type: 'USER_CLICK',
      data: {
        traceId: 'I' + (++__isolatedTraceCounter) + '_' + now,
        triggerInfo: info,
        clickTime: now,
        pageTitle: ctx.pageTitle,
        pageUrl: ctx.pageUrl
      }
    });
  }, true);

  // 监听 main world 发来的 postMessage，转发给 background service worker
  window.addEventListener('message', function(event) {
  // 只处理来自当前窗口 main world 的消息
  if (event.source !== window) return;
  if (!event.data) return;

  // 处理页面上下文更新消息
  if (event.data.source === '__HTTP_CAPTURE_CONTEXT__') {
    const payload = event.data.payload;
    if (payload && payload.pageUrl) {
      safeSendMessage({ type: 'PAGE_CONTEXT', data: payload });
    }
    return;
  }

  if (event.data.source === '__HTTP_CAPTURE_CLICK__') {
    const payload = event.data.payload;
    if (payload && payload.triggerInfo) {
      safeSendMessage({ type: 'USER_CLICK', data: payload });
    }
    return;
  }

  if (event.data.source !== '__HTTP_CAPTURE_INJECTED__') return;

  const data = event.data.payload;
  if (data && data.url) {
    safeSendMessage({ type: 'CAPTURED_REQUEST', data: data });
  }
  });
}
