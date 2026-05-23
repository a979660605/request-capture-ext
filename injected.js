(function() {
  if (window.__HTTP_CAPTURE_INJECTED_READY__) return;
  window.__HTTP_CAPTURE_INJECTED_READY__ = true;
  function resolveUrl(url) {
    if (!url) return "";
    try { return new URL(url, window.location.href).href; } catch(e) {}
    try { return new URL(url).href; } catch(e) {}
    return url;
  }
  var __lastClickInfo = null;
  var __CLICK_TTL = 2000;
  var __activeTraces = [];
  var __MAX_CONCURRENT_TRACES = 5;
  var __TRACE_TTL = 15000;
  var __TRACE_GAP = 3000;
  var __traceIdCounter = 0;
  var __lastClickTime = 0;
  function findMatchingTrace() {
    var now = Date.now();
    __activeTraces = __activeTraces.filter(function(t) {
      return (now - t.createdAt < __TRACE_TTL) && (now - t.lastRequestAt < __TRACE_GAP);
    });
    for (var i = __activeTraces.length - 1; i >= 0; i--) {
      var t = __activeTraces[i];
      if ((now - t.createdAt < __TRACE_TTL) && (now - t.lastRequestAt < __TRACE_GAP)) {
        return t;
      }
    }
    return null;
  }
  function findTriggerElement(el) {
    if (!el || !el.tagName) return null;
    var actionableTags = ["A","BUTTON","INPUT","SELECT","TEXTAREA","SUMMARY","OPTION"];
    var current = el;
    for (var i = 0; i < 5; i++) {
      if (!current || !current.tagName) break;
      var tag = current.tagName.toUpperCase();
      if (actionableTags.indexOf(tag) >= 0) return current;
      var role = current.getAttribute("role");
      if (role && ["button","link","menuitem","tab","option","switch","checkbox","radio"].indexOf(role) >= 0) return current;
      if (current.getAttribute("tabindex") !== null && current.getAttribute("tabindex") !== "") return current;
      if (current.getAttribute("onclick")) return current;
      current = current.parentElement;
    }
    return el;
  }
  function extractElementInfo(el) {
    if (!el || !el.tagName) return null;
    var tag = el.tagName.toLowerCase();
    var text = "";
    if (el.getAttribute("aria-label")) {
      text = el.getAttribute("aria-label");
    } else if (el.getAttribute("title")) {
      text = el.getAttribute("title");
    } else if (el.alt) {
      text = el.alt;
    } else if (el.textContent) {
      text = el.textContent.trim().substring(0, 60);
    } else if (el.value) {
      text = String(el.value).substring(0, 60);
    }
    var selector = "";
    if (el.id) {
      selector = "#" + el.id;
    } else if (el.className && typeof el.className === "string") {
      var classes = el.className.trim().split(/\s+/).slice(0, 2).join(".");
      selector = tag + "." + classes;
    } else {
      selector = tag;
    }
    return {
      tag: tag,
      text: text,
      id: el.id || "",
      className: (typeof el.className === "string") ? el.className.substring(0, 100) : "",
      href: el.href || "",
      type: el.type || "",
      name: el.name || "",
      role: el.getAttribute("role") || "",
      ariaLabel: el.getAttribute("aria-label") || "",
      title: el.getAttribute("title") || "",
      selector: selector
    };
  }
  document.addEventListener("click", function(e) {
    var now = Date.now();
    if (now - __lastClickTime < 100) return;
    __lastClickTime = now;
    var target = e.target || e.srcElement;
    var triggerEl = findTriggerElement(target);
    var info = extractElementInfo(triggerEl);
    if (info) {
      if (__activeTraces.length >= __MAX_CONCURRENT_TRACES) {
        __activeTraces.shift();
      }
      var traceId = "T" + (++__traceIdCounter) + "_" + now;
      __activeTraces.push({
        id: traceId,
        trigger: info,
        createdAt: now,
        lastRequestAt: now,
        sequence: 0
      });
      __lastClickInfo = {
        element: info,
        clickTime: now
      };
      window.postMessage({ source: "__HTTP_CAPTURE_CLICK__", payload: { traceId: traceId, triggerInfo: info, clickTime: now, pageTitle: document.title || __pageTitle || "", pageUrl: __pageUrl || window.location.href } }, "*");
    }
  }, true);
  var __pageUrl = window.location.href;
  try {
    if (window.self !== window.top && window.parent.location.href) {
      __pageUrl = window.parent.location.href;
    }
  } catch(e) {}
  var __pageTitle = document.title || "";
  function __watchTitle() {
    var titleEl = document.querySelector("title");
    if (titleEl) {
      new MutationObserver(function() {
        __pageTitle = document.title || "";
      }).observe(titleEl, { childList: true, characterData: true, subtree: true });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __watchTitle);
  } else {
    __watchTitle();
  }
  function __updateContext() {
    __pageUrl = window.location.href;
    try {
      if (window.self !== window.top && window.parent.location.href) {
        __pageUrl = window.parent.location.href;
      }
    } catch(e) {}
    __pageTitle = document.title || __pageTitle;
    window.postMessage({ source: "__HTTP_CAPTURE_CONTEXT__", payload: { pageTitle: __pageTitle, pageUrl: __pageUrl } }, "*");
    setTimeout(function() {
      var newTitle = document.title || "";
      if (newTitle && newTitle !== __pageTitle) {
        __pageTitle = newTitle;
        window.postMessage({ source: "__HTTP_CAPTURE_CONTEXT__", payload: { pageTitle: __pageTitle, pageUrl: __pageUrl } }, "*");
      }
    }, 300);
  }
  var __origPushState = history.pushState;
  history.pushState = function() { __origPushState.apply(this, arguments); __updateContext(); };
  var __origReplaceState = history.replaceState;
  history.replaceState = function() { __origReplaceState.apply(this, arguments); __updateContext(); };
  window.addEventListener("popstate", __updateContext);
  window.addEventListener("hashchange", __updateContext);
  function captureRequest(url, method, headers, body) {
    var currentTitle = document.title || __pageTitle;
    var entry = { url: resolveUrl(url), method: method, headers: headers || [], time: Date.now(), pageTitle: currentTitle, pageUrl: __pageUrl };
    if (__lastClickInfo && (Date.now() - __lastClickInfo.clickTime < __CLICK_TTL)) {
      entry.triggerInfo = __lastClickInfo.element;
      entry.triggerDelay = Date.now() - __lastClickInfo.clickTime;
    }
    var trace = findMatchingTrace();
    if (trace) {
      entry.traceId = trace.id;
      entry.traceSequence = ++trace.sequence;
      trace.lastRequestAt = Date.now();
    }
    if (body && ["POST","PUT","PATCH"].indexOf(method) >= 0) {
      if (typeof body === "string") entry.body = body;
      else if (body instanceof URLSearchParams) entry.body = body.toString();
      else if (body instanceof FormData) {
        try {
          var params = [];
          body.forEach(function(value, key) {
            if (typeof value === "string") params.push(key + "=" + encodeURIComponent(value));
          });
          entry.body = params.join("&");
        } catch(e) {}
      }
    }
    window.postMessage({ source: "__HTTP_CAPTURE_INJECTED__", payload: entry }, "*");
  }
  function extractFetchHeaders(h) {
    if (!h) return [];
    if (h instanceof Headers) { var r = []; h.forEach(function(v,k){ r.push({name:k,value:v}); }); return r; }
    if (typeof h === "object") { var r = []; for (var k in h) { if (h.hasOwnProperty(k)) r.push({name:k,value:h[k]}); } return r; }
    return [];
  }
  var __origFetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      var method = (init && init.method) || (typeof input === "object" && input.method) || "GET";
      var reqUrl = typeof input === "string" ? input : (input.url || input.href || "");
      captureRequest(reqUrl, method.toUpperCase(), init ? extractFetchHeaders(init.headers) : [], init ? init.body : null);
    } catch(e) {}
    return __origFetch.call(window, input, init);
  };
  var __origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.__cr_url = typeof url === "string" ? url : "";
    this.__cr_method = method;
    this.__cr_headers = [];
    return __origOpen.apply(this, arguments);
  };
  var __origSetRH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    this.__cr_headers = this.__cr_headers || [];
    this.__cr_headers.push({ name: name, value: value });
    return __origSetRH.apply(this, arguments);
  };
  var __origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    try {
      var m = (this.__cr_method || "GET").toUpperCase();
      captureRequest(this.__cr_url || "", m, this.__cr_headers || [], body);
    } catch(e) {}
    return __origSend.apply(this, arguments);
  };
})();
