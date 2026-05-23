// ============================================================
// HTTP Request Capture - Popup Script
// ============================================================

// DOM 元素
const statusBadge = document.getElementById('statusBadge');
const langToggle = document.getElementById('langToggle');
const btnToggle = document.getElementById('btnToggle');
const toggleIcon = document.getElementById('toggleIcon');
const toggleText = document.getElementById('toggleText');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const countBadge = document.getElementById('countBadge');
const searchInput = document.getElementById('searchInput');
const methodFilters = document.getElementById('methodFilters');
const requestList = document.getElementById('requestList');
const footerInfo = document.getElementById('footerInfo');
const btnFilterStatic = document.getElementById('btnFilterStatic');
const filterIcon = document.getElementById('filterIcon');
const filterText = document.getElementById('filterText');
const btnFilterTrigger = document.getElementById('btnFilterTrigger');
const triggerFilterText = document.getElementById('triggerFilterText');
const btnFilterError = document.getElementById('btnFilterError');
const errorFilterText = document.getElementById('errorFilterText');
const btnFilterSlow = document.getElementById('btnFilterSlow');
const slowFilterText = document.getElementById('slowFilterText');
const btnErrorOverview = document.getElementById('btnErrorOverview');
const errorOverviewText = document.getElementById('errorOverviewText');
// btnTopology and topologyText were removed (topology view deleted)
const btnExportClear = document.getElementById('btnExportClear');
const exportFormat = document.getElementById('exportFormat');
const btnRefresh = document.getElementById('btnRefresh');
const btnExpandAll = document.getElementById('btnExpandAll');
const btnCollapseAll = document.getElementById('btnCollapseAll');
const btnProxy = document.getElementById('btnProxy');
const proxyBar = document.getElementById('proxyBar');
const proxyTargetInput = document.getElementById('proxyTargetInput');
const proxyPathFrom = document.getElementById('proxyPathFrom');
const proxyPathTo = document.getElementById('proxyPathTo');
const proxyCustomCookie = document.getElementById('proxyCustomCookie');
const btnSaveProxy = document.getElementById('btnSaveProxy');
const btnPostman = document.getElementById('btnPostman');
const postmanBar = document.getElementById('postmanBar');
const postmanApiKey = document.getElementById('postmanApiKey');
const postmanWorkspace = document.getElementById('postmanWorkspace');
const postmanCollectionName = document.getElementById('postmanCollectionName');
const btnSyncPostman = document.getElementById('btnSyncPostman');
const btnCallChain = document.getElementById('btnCallChain');
const chainText = document.getElementById('chainText');
const selectAll = document.getElementById('selectAll');
const btnExportSelected = document.getElementById('btnExportSelected');
const selectedCountEl = document.getElementById('selectedCount');
const btnFilterStarred = document.getElementById('btnFilterStarred');
const starFilterText = document.getElementById('starFilterText');
const domainDropdownBtn = document.getElementById('domainDropdownBtn');
const domainDropdownText = document.getElementById('domainDropdownText');
const domainDropdownMenu = document.getElementById('domainDropdownMenu');
const domainDropdownList = document.getElementById('domainDropdownList');
const drawerHandle = document.getElementById('drawerHandle');
const drawerTitle = document.getElementById('drawerTitle');
const drawerMethodBadge = document.getElementById('drawerMethodBadge');
const drawerStatus = document.getElementById('drawerStatus');
const drawerClose = document.getElementById('drawerClose');
const drawerCopyUrl = document.getElementById('drawerCopyUrl');
const drawerCopyCurl = document.getElementById('drawerCopyCurl');
const drawerSendLocal = document.getElementById('drawerSendLocal');
const drawerExportSingle = document.getElementById('drawerExportSingle');
const drawerTabs = document.getElementById('drawerTabs');
const drawerSectionInfo = document.getElementById('drawerSectionInfo');
const drawerSectionHeaders = document.getElementById('drawerSectionHeaders');
const drawerSectionBody = document.getElementById('drawerSectionBody');
const drawerSectionResponse = document.getElementById('drawerSectionResponse');
const drawerSectionTrigger = document.getElementById('drawerSectionTrigger');
const confirmStats = document.getElementById('confirmStats');
const exportModal = document.getElementById('exportModal');
const exportModalBody = document.getElementById('exportModalBody');
const exportModalClose = document.getElementById('exportModalClose');
const onboardingOverlay = document.getElementById('onboardingOverlay');
const onboardingStart = document.getElementById('onboardingStart');

// ============================================================
// I18N
// ============================================================
const I18N_STORAGE_KEY = 'requestCaptureLanguage';
const DEFAULT_LANGUAGE = (() => {
  const uiLang = (chrome.i18n && chrome.i18n.getUILanguage ? chrome.i18n.getUILanguage() : navigator.language || '').toLowerCase();
  return uiLang.startsWith('zh') ? 'zh' : 'en';
})();

let currentLanguage = localStorage.getItem(I18N_STORAGE_KEY) || DEFAULT_LANGUAGE;

const I18N = {
  zh: {
    start: '启动',
    stop: '停止',
    stopped: '已停止',
    capturing: '● 捕获中',
    clear: '清空',
    export: '导出',
    proxy: '代理',
    postman: 'Postman',
    all: '全部',
    api: 'API',
    allRequests: '全部请求',
    triggered: '有触发',
    error: '错误',
    overview: '概览',
    slow: '慢请求',
    starred: '已标记',
    marked: '★标记',
    operationApi: '操作API',
    close: '关闭',
    requestCount: '{count} 个请求',
    selectedCount: '已选 {count}',
    searchPlaceholder: '搜索 URL、方法、状态码...',
    allDomains: '🌐 全部域名',
    proxyTarget: '代理目标',
    save: '保存',
    pathRewrite: '路径重写',
    rewriteHint: '将原路径前缀替换为目标前缀后转发',
    customCookie: '自定义Cookie',
    cookieHint: '转发时用此 Cookie 覆盖原始请求的 Cookie',
    syncPostman: '同步到 Postman',
    workspaceHint: '留空则同步到默认 Workspace',
    collectionHint: '将在 Postman 中创建或更新的集合名称',
    optionalWorkspacePlaceholder: 'workspace_id（可选）',
    selectAll: '全选',
    exportSelected: '导出选中',
    expandAll: '展开全部',
    collapseAll: '折叠全部',
    emptyRequests: '暂无捕获的请求',
    emptyHintStopped: '点击「启动」开始捕获',
    emptyHintCapturing: '操作页面或点击 ↻ 刷新以触发网络请求',
    noMatches: '没有匹配的请求',
    noMatchesHint: '尝试修改搜索条件',
    copyUrl: '复制 URL',
    sendLocal: '发送到本地',
    basicInfo: '基本信息',
    requestHeaders: '请求头',
    requestBody: '请求体',
    responseHeaders: '响应头',
    triggerSource: '触发来源',
    waitingStart: '等待启动...',
    footerHints: '↑↓ 导航 · 关闭按钮收起详情',
    confirm: '确认',
    doNotAsk: '不再提示',
    currentDomainOnly: '仅清空当前域名',
    cancel: '取消',
    confirmClear: '确定清空',
    exportSuccess: '导出成功',
    onboardingTitle: '快速开始',
    onboardingStep1: '1. 点击「启动」开始捕获',
    onboardingStep2: '2. 操作你的网页触发请求',
    onboardingStep3: '3. 点击请求查看详情',
    onboardingTip1: '点击按钮会自动追踪触发来源',
    onboardingTip2: '查询、编辑、保存等操作会自动归类对应请求',
    startUsing: '开始使用',
    clickStart: '点击「启动」开始捕获请求',
    capturingHint: '捕获中... 操作页面或点击 ↻ 刷新以触发请求',
    startedToast: '开始捕获请求',
    stoppedToast: '已停止捕获',
    clearedToast: '已清空',
    clearFailed: '清空失败: {error}',
    clearDomainToast: '已清空域名 {domain}',
    noExportRequests: '没有可导出的请求',
    noSelectedRequests: '请先勾选要导出的请求',
    exportDoneToast: '导出成功！可在下载中找到 {format} 文件',
    exportFailed: '导出失败: {error}',
    format: '格式',
    requests: '请求数',
    domains: '域名数',
    methodStats: '方法分布',
    errorRequests: '异常请求',
    exportedAt: '导出时间',
    copied: '已复制',
    copyFailed: '复制失败',
    urlCopied: 'URL 已复制',
    curlWinCopied: '已复制 cURL（Windows 格式，右键点击复制 bash 格式）',
    bashCopied: '已复制 bash 格式',
    proxyTargetRequired: '请输入代理目标地址',
    proxySaved: '代理配置已保存',
    saveFailed: '保存失败',
    proxyMissing: '请先在代理设置中配置目标地址',
    sentLocal: '已发送 → {status} {statusText}',
    replayFailed: '转发失败: {error}',
    postmanKeyRequired: '请输入 Postman API Key',
    noSyncRequests: '没有可同步的请求',
    syncing: '同步中...',
    syncedPostman: '已同步到 Postman: {name}',
    syncFailed: '同步失败: {error}',
    pageRefreshed: '页面已刷新',
    unknownError: '未知错误',
    unknownPage: '未知页面',
    untraced: '未关联请求',
    clickAction: '点击操作',
    operationEmpty: '暂无操作/API数据',
    operationHint: '点击查询、编辑、保存等操作后会自动关联请求',
    pagesOpsRequests: '{pages} 个页面 · {operations} 个操作 · {requests} 个已关联请求',
    untracedRequests: '{count} 个未关联请求',
    operationsRequests: '{operations} 个操作 · {requests} 个请求',
    clickCount: '{count} 次点击',
    unassociated: '未关联',
    noMatchedClick: '这些请求没有匹配到点击操作',
    operationFooter: '操作/API: {operations} 个操作 · {traced} 个已关联请求 · {untraced} 个未关联',
    showing: '显示 {visible} / 共 {total} 个请求',
    totalRequests: '共 {count} 个请求',
    avg: '平均 {value}ms',
    slowCount: '慢 {count}',
    slowTop5: '慢请求 Top 5',
    noErrors: '没有错误请求',
    allOk: '所有请求均正常返回',
    noErrorsFooter: '共 {count} 个请求，无错误',
    errorOverviewCount: '共 {count} 个错误',
    copyErrorSummary: '复制错误摘要',
    backToList: '返回列表',
    byStatus: '按状态码',
    byErrorType: '按错误类型',
    clientError: '客户端错误',
    serverError: '服务端错误',
    errorSummaryCopied: '错误摘要已复制',
    errorOverviewFooter: '错误概览: {errors} / 共 {total} 个请求',
    formData: '表单数据',
    rawData: '原始数据',
    mixedData: '混合数据（含文件）',
    unknown: '未知',
    requestUrl: '请求URL',
    redirectChain: '重定向链',
    queryParams: '查询参数',
    method: '方法',
    statusCode: '状态码',
    type: '类型',
    time: '时间',
    duration: '耗时',
    pageTitle: '页面标题',
    pageUrl: '页面URL',
    requestBodyWithType: '请求体 ({type})',
    noRequestHeaders: '无请求头信息',
    noRequestBody: '无请求体数据',
    noResponseHeaders: '无响应头信息',
    replayResult: '代理转发结果',
    status: '状态',
    noTriggerInfo: '无触发来源信息',
    elementType: '元素类型',
    elementText: '元素文本',
    role: '角色',
    ariaLabel: 'ARIA标签',
    elementId: '元素ID',
    selector: '选择器',
    linkHref: '链接地址',
    inputType: '输入类型',
    elementName: '元素名称',
    triggerDelay: '响应延迟',
    markRequest: '标记请求',
    unmarkRequest: '取消标记',
    loadMore: '▼ 加载更多',
    entries: '共 {count} 条',
    clearPrompt: '确定清空以上请求吗？',
    clearDelete: '将删除 {count} 个请求',
    clearDomains: '涉及 {count} 个域名',
    clearErrors: '含 {count} 个异常请求',
    clearTriggers: '含 {count} 个有触发来源',
    clearChains: '含 {count} 条调用链',
    switchLanguage: '切换到英语',
    exportClearTitle: '导出所有请求后清空列表',
    proxyTitle: '配置代理转发目标',
    postmanTitle: '同步到 Postman',
    refreshTitle: '刷新当前页面触发新请求',
    filterStaticTitle: '显示/隐藏静态资源请求',
    filterTriggerTitle: '只显示有点击触发的请求',
    filterErrorTitle: '只显示异常请求（4xx/5xx/错误）',
    filterSlowTitle: '只显示慢请求（>1s）',
    filterStarredTitle: '只显示已标记的请求',
    errorOverviewTitle: '错误概览视图',
    callChainTitle: '操作/API 映射视图',
    domainFilterTitle: '按域名筛选',
    selectAllTitle: '全选/取消全选',
    langButton: 'EN'
  },
  en: {
    start: 'Start',
    stop: 'Stop',
    stopped: 'Stopped',
    capturing: '● Capturing',
    clear: 'Clear',
    export: 'Export',
    proxy: 'Proxy',
    postman: 'Postman',
    all: 'All',
    api: 'API',
    allRequests: 'All requests',
    triggered: 'Triggered',
    error: 'Errors',
    overview: 'Overview',
    slow: 'Slow',
    starred: 'Starred',
    marked: '★Starred',
    operationApi: 'Operation API',
    close: 'Close',
    requestCount: '{count} requests',
    selectedCount: 'Selected {count}',
    searchPlaceholder: 'Search URL, method, status...',
    allDomains: '🌐 All domains',
    proxyTarget: 'Proxy target',
    save: 'Save',
    pathRewrite: 'Path rewrite',
    rewriteHint: 'Replace the original path prefix before replaying',
    customCookie: 'Custom Cookie',
    cookieHint: 'Override original Cookie when replaying',
    syncPostman: 'Sync to Postman',
    workspaceHint: 'Leave empty to use the default workspace',
    collectionHint: 'Collection to create or update in Postman',
    optionalWorkspacePlaceholder: 'workspace_id (optional)',
    selectAll: 'Select all',
    exportSelected: 'Export selected',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    emptyRequests: 'No captured requests',
    emptyHintStopped: 'Click Start to capture requests',
    emptyHintCapturing: 'Use the page or click ↻ to trigger requests',
    noMatches: 'No matching requests',
    noMatchesHint: 'Try changing filters',
    copyUrl: 'Copy URL',
    sendLocal: 'Send local',
    basicInfo: 'Info',
    requestHeaders: 'Request headers',
    requestBody: 'Body',
    responseHeaders: 'Response headers',
    triggerSource: 'Trigger source',
    waitingStart: 'Waiting to start...',
    footerHints: '↑↓ Navigate · Close button hides details',
    confirm: 'Confirm',
    doNotAsk: 'Do not ask again',
    currentDomainOnly: 'Current domain only',
    cancel: 'Cancel',
    confirmClear: 'Clear',
    exportSuccess: 'Export complete',
    onboardingTitle: 'Quick start',
    onboardingStep1: '1. Click Start to capture',
    onboardingStep2: '2. Use your page to trigger requests',
    onboardingStep3: '3. Click a request to inspect it',
    onboardingTip1: 'Button clicks are tracked automatically',
    onboardingTip2: 'Search, edit, save and other actions are grouped with APIs',
    startUsing: 'Start',
    clickStart: 'Click Start to capture requests',
    capturingHint: 'Capturing... use the page or click ↻ to trigger requests',
    startedToast: 'Started capturing',
    stoppedToast: 'Stopped capturing',
    clearedToast: 'Cleared',
    clearFailed: 'Clear failed: {error}',
    clearDomainToast: 'Cleared domain {domain}',
    noExportRequests: 'No requests to export',
    noSelectedRequests: 'Select requests first',
    exportDoneToast: 'Export complete. Find the {format} file in downloads.',
    exportFailed: 'Export failed: {error}',
    format: 'Format',
    requests: 'Requests',
    domains: 'Domains',
    methodStats: 'Methods',
    errorRequests: 'Error requests',
    exportedAt: 'Exported at',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    urlCopied: 'URL copied',
    curlWinCopied: 'Copied cURL for Windows. Right-click for bash format.',
    bashCopied: 'Copied bash format',
    proxyTargetRequired: 'Enter a proxy target',
    proxySaved: 'Proxy saved',
    saveFailed: 'Save failed',
    proxyMissing: 'Configure a proxy target first',
    sentLocal: 'Sent → {status} {statusText}',
    replayFailed: 'Replay failed: {error}',
    postmanKeyRequired: 'Enter a Postman API key',
    noSyncRequests: 'No requests to sync',
    syncing: 'Syncing...',
    syncedPostman: 'Synced to Postman: {name}',
    syncFailed: 'Sync failed: {error}',
    pageRefreshed: 'Page refreshed',
    unknownError: 'Unknown error',
    unknownPage: 'Unknown page',
    untraced: 'Unlinked requests',
    clickAction: 'Click action',
    operationEmpty: 'No operation/API data',
    operationHint: 'Click search, edit, save and other actions to link requests',
    pagesOpsRequests: '{pages} pages · {operations} operations · {requests} linked requests',
    untracedRequests: '{count} unlinked requests',
    operationsRequests: '{operations} operations · {requests} requests',
    clickCount: '{count} clicks',
    unassociated: 'Unlinked',
    noMatchedClick: 'These requests were not matched to a click action',
    operationFooter: 'Operation/API: {operations} operations · {traced} linked · {untraced} unlinked',
    showing: 'Showing {visible} / {total} requests',
    totalRequests: '{count} requests',
    avg: 'avg {value}ms',
    slowCount: 'slow {count}',
    slowTop5: 'Top 5 slow requests',
    noErrors: 'No error requests',
    allOk: 'All requests returned normally',
    noErrorsFooter: '{count} requests, no errors',
    errorOverviewCount: '{count} errors',
    copyErrorSummary: 'Copy error summary',
    backToList: 'Back to list',
    byStatus: 'By status code',
    byErrorType: 'By error type',
    clientError: 'Client error',
    serverError: 'Server error',
    errorSummaryCopied: 'Error summary copied',
    errorOverviewFooter: 'Error overview: {errors} / {total} requests',
    formData: 'Form data',
    rawData: 'Raw data',
    mixedData: 'Mixed data (with files)',
    unknown: 'Unknown',
    requestUrl: 'Request URL',
    redirectChain: 'Redirect chain',
    queryParams: 'Query params',
    method: 'Method',
    statusCode: 'Status code',
    type: 'Type',
    time: 'Time',
    duration: 'Duration',
    pageTitle: 'Page title',
    pageUrl: 'Page URL',
    requestBodyWithType: 'Body ({type})',
    noRequestHeaders: 'No request headers',
    noRequestBody: 'No request body',
    noResponseHeaders: 'No response headers',
    replayResult: 'Proxy replay result',
    status: 'Status',
    noTriggerInfo: 'No trigger source',
    elementType: 'Element type',
    elementText: 'Element text',
    role: 'Role',
    ariaLabel: 'ARIA label',
    elementId: 'Element ID',
    selector: 'Selector',
    linkHref: 'Link href',
    inputType: 'Input type',
    elementName: 'Element name',
    triggerDelay: 'Trigger delay',
    markRequest: 'Star request',
    unmarkRequest: 'Unstar request',
    loadMore: '▼ Load more',
    entries: '{count} entries',
    clearPrompt: 'Clear these requests?',
    clearDelete: 'Delete {count} requests',
    clearDomains: 'Across {count} domains',
    clearErrors: 'Includes {count} error requests',
    clearTriggers: 'Includes {count} triggered requests',
    clearChains: 'Includes {count} chains',
    switchLanguage: 'Switch to Chinese',
    exportClearTitle: 'Export all requests, then clear the list',
    proxyTitle: 'Configure proxy replay target',
    postmanTitle: 'Sync to Postman',
    refreshTitle: 'Refresh the current page to trigger requests',
    filterStaticTitle: 'Show or hide static resource requests',
    filterTriggerTitle: 'Show only requests linked to clicks',
    filterErrorTitle: 'Show only failed requests (4xx/5xx/errors)',
    filterSlowTitle: 'Show only slow requests (>1s)',
    filterStarredTitle: 'Show only starred requests',
    errorOverviewTitle: 'Error overview',
    callChainTitle: 'Operation/API mapping view',
    domainFilterTitle: 'Filter by domain',
    selectAllTitle: 'Select or deselect all',
    langButton: '中'
  }
};

function t(key, vars = {}) {
  const source = I18N[currentLanguage] || I18N.zh;
  const fallback = I18N.zh;
  let value = source[key] || fallback[key] || key;
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replaceAll('{' + name + '}', String(replacement));
  }
  return value;
}

function setText(el, key, vars) {
  if (el) el.textContent = t(key, vars);
}

function setTitle(el, key, vars) {
  if (el) el.title = t(key, vars);
}

function applyStaticI18n() {
  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
  if (langToggle) {
    langToggle.textContent = t('langButton');
    langToggle.title = t('switchLanguage');
  }
  setText(toggleText, state.isCapturing ? 'stop' : 'start');
  setText(document.getElementById('filterText'), filterStaticResources ? 'api' : 'all');
  setText(document.getElementById('triggerFilterText'), filterTriggerOnly ? 'triggered' : 'allRequests');
  setText(document.getElementById('errorFilterText'), filterErrorsOnly ? 'error' : 'all');
  setText(document.getElementById('slowFilterText'), filterSlowOnly ? 'slow' : 'all');
  setText(document.getElementById('starFilterText'), filterStarredOnly ? 'marked' : 'starred');
  setText(document.getElementById('errorOverviewText'), errorOverviewMode ? 'overview' : 'error');
  setText(document.getElementById('chainText'), chainMode ? 'close' : 'operationApi');
  setText(document.getElementById('proxyText'), 'proxy');
  setText(document.getElementById('postmanText'), 'postman');
  setText(document.getElementById('btnSaveProxy'), 'save');
  setText(document.getElementById('btnSyncPostman'), 'syncPostman');
  setText(document.getElementById('btnExportSelected'), 'exportSelected');
  setText(document.getElementById('btnExpandAll'), 'expandAll');
  setText(document.getElementById('btnCollapseAll'), 'collapseAll');
  setText(document.getElementById('drawerCopyUrl'), 'copyUrl');
  setText(document.getElementById('drawerSendLocal'), 'sendLocal');
  setText(document.getElementById('drawerExportSingle'), 'export');
  setText(document.getElementById('confirmTitle'), 'confirm');
  setText(document.getElementById('confirmCancel'), 'cancel');
  setText(document.getElementById('confirmOk'), 'confirmClear');
  setText(onboardingStart, 'startUsing');
  searchInput.placeholder = t('searchPlaceholder');
  if (postmanWorkspace) postmanWorkspace.placeholder = t('optionalWorkspacePlaceholder');
  domainDropdownText.textContent = t('allDomains');
  const allDomainItem = document.querySelector('.domain-dropdown-item[data-domain=""]');
  if (allDomainItem) allDomainItem.textContent = t('allDomains');

  const staticTextMap = [
    ['btnClearText', 'clear'],
    ['btnExportText', 'export'],
    ['selectedCount', 'selectedCount', { count: selectedIds.size }]
  ];
  for (const [id, key, vars] of staticTextMap) setText(document.getElementById(id), key, vars);

  const methodAll = document.querySelector('.method-tag[data-method=""]');
  if (methodAll) methodAll.textContent = t('all');

  const labels = document.querySelectorAll('.proxy-label');
  if (labels[0]) labels[0].textContent = t('proxyTarget');
  if (labels[1]) labels[1].textContent = t('pathRewrite');
  if (labels[2]) labels[2].textContent = t('customCookie');
  if (labels[3]) labels[3].textContent = 'API Key';
  if (labels[4]) labels[4].textContent = 'Workspace';
  if (labels[5]) labels[5].textContent = 'Collection';

  const hints = document.querySelectorAll('.proxy-hint');
  if (hints[0]) hints[0].textContent = t('rewriteHint');
  if (hints[1]) hints[1].textContent = t('cookieHint');
  if (hints[2]) hints[2].textContent = t('workspaceHint');
  if (hints[3]) hints[3].textContent = t('collectionHint');

  const batchSpan = document.querySelector('.batch-checkbox-label span');
  if (batchSpan) batchSpan.textContent = t('selectAll');

  const tabs = document.querySelectorAll('.drawer-tab');
  const tabKeys = ['basicInfo', 'requestHeaders', 'requestBody', 'responseHeaders', 'triggerSource'];
  tabs.forEach((tab, index) => { tab.textContent = t(tabKeys[index]); });

  const confirmRemember = document.querySelector('#confirmRemember + span');
  if (confirmRemember) confirmRemember.textContent = t('doNotAsk');
  const confirmDomain = document.querySelector('#confirmDomainOnly + span');
  if (confirmDomain) confirmDomain.textContent = t('currentDomainOnly');
  const exportHeader = document.querySelector('.export-modal-header span');
  if (exportHeader) exportHeader.textContent = '✓ ' + t('exportSuccess');
  const onboardingTitle = document.querySelector('.onboarding-title');
  if (onboardingTitle) onboardingTitle.textContent = t('onboardingTitle');
  const onboardingSteps = document.querySelectorAll('.onboarding-step');
  ['onboardingStep1', 'onboardingStep2', 'onboardingStep3'].forEach((key, index) => {
    if (onboardingSteps[index]) onboardingSteps[index].textContent = t(key);
  });
  const onboardingTips = document.querySelectorAll('.onboarding-tip');
  ['onboardingTip1', 'onboardingTip2'].forEach((key, index) => {
    if (onboardingTips[index]) onboardingTips[index].textContent = t(key);
  });
  const footerHints = document.querySelector('.footer-hints');
  if (footerHints) footerHints.textContent = t('footerHints');
  setTitle(btnExportClear, 'exportClearTitle');
  setTitle(btnProxy, 'proxyTitle');
  setTitle(btnPostman, 'postmanTitle');
  setTitle(btnRefresh, 'refreshTitle');
  setTitle(btnFilterStatic, 'filterStaticTitle');
  setTitle(btnFilterTrigger, 'filterTriggerTitle');
  setTitle(btnFilterError, 'filterErrorTitle');
  setTitle(btnFilterSlow, 'filterSlowTitle');
  setTitle(btnFilterStarred, 'filterStarredTitle');
  setTitle(btnErrorOverview, 'errorOverviewTitle');
  setTitle(btnCallChain, 'callChainTitle');
  setTitle(domainDropdownBtn, 'domainFilterTitle');
  const batchCheckboxLabel = document.querySelector('.batch-checkbox-label');
  if (batchCheckboxLabel) batchCheckboxLabel.title = t('selectAllTitle');
  updateUI();
}

// 状态
let state = {
  isCapturing: false,
  total: 0,
  requests: []
};

const PAGE_SIZE = 80;
let searchTimer = null;
let filterStaticResources = false;
let filterTriggerOnly = false;
let filterErrorsOnly = false;
let filterSlowOnly = false;
let filterStarredOnly = false;
let errorOverviewMode = false;
let chainMode = false;
let selectedDomain = '';
let starredRequests = new Set();
let expandedErrorGroups = new Set();
let selectedMethods = new Set();
let activeRequestId = null;
let expandedDomains = new Set();
let domainRenderCount = new Map();
let scrollObserver = null;
let popupPort = null;
let fallbackInterval = null;
let selectedIds = new Set();

// ============================================================
// 初始化（必须尽早执行，防止后续事件绑定抛错导致初始化被跳过）
// ============================================================
let initReceived = false;

applyStaticI18n();
loadStarredState();
if (!localStorage.getItem('onboardingDone')) {
  onboardingOverlay.style.display = 'flex';
}
connectPort();
startFallbackPoll();
window.addEventListener('unload', () => {
  if (popupPort) popupPort.disconnect();
  stopFallbackPoll();
});

// GET_STATE 回退 + DIAGNOSE
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response) {
    if (!initReceived) {
      console.log('[POPUP] INIT not yet received, using GET_STATE fallback:', response.isCapturing);
    }
    const needsRender = (state.requests.length === 0 && response.requests && response.requests.length > 0);
    state.isCapturing = response.isCapturing;
    state.total = response.total;
    if (response.requests && response.requests.length > 0) {
      state.requests = response.requests;
    }
    updateUI();
    if (needsRender) {
      renderRequests(state.requests);
    }
    restoreDetailState();
  }
});
chrome.runtime.sendMessage({ type: 'DIAGNOSE' }, (diag) => {
  console.log('[POPUP] DIAGNOSE:', JSON.stringify(diag));
});

// 定期记录 popup 本地状态，用于诊断状态异常
setInterval(() => {
  if (state) {
    console.log(`[POPUP] State heartbeat: isCapturing=${state.isCapturing}, total=${state.total}, requests=${state.requests.length}`);
  }
}, 3000);

// ============================================================
// Toast 通知
// ============================================================
function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ============================================================
// 自定义确认对话框
// ============================================================
function showConfirm(message, showRemember = false, showDomainOption = false) {
  return new Promise(resolve => {
    const dialog = document.getElementById('confirmDialog');
    const msgEl = document.getElementById('confirmMessage');
    const rememberRow = document.getElementById('confirmOptions');
    const rememberCb = document.getElementById('confirmRemember');
    const domainRow = document.getElementById('domainOptionRow');
    const domainCb = document.getElementById('confirmDomainOnly');

    msgEl.textContent = message;
    rememberRow.style.display = (showRemember || showDomainOption) ? 'flex' : 'none';
    if (showRemember) {
      rememberCb.checked = !!localStorage.getItem('skipClearConfirm');
      rememberCb.parentElement.style.display = 'flex';
    } else {
      rememberCb.parentElement.style.display = 'none';
    }
    if (showDomainOption) {
      domainRow.style.display = 'flex';
      domainCb.checked = false;
    } else {
      domainRow.style.display = 'none';
    }

    const skip = localStorage.getItem('skipClearConfirm');
    if (showRemember && skip && !showDomainOption) {
      resolve({ confirmed: true, domainOnly: false });
      return;
    }

    dialog.classList.add('show');
    const ok = document.getElementById('confirmOk');
    const cancel = document.getElementById('confirmCancel');
    function cleanup(result) {
      dialog.classList.remove('show');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      if (showRemember) {
        if (rememberCb.checked) {
          localStorage.setItem('skipClearConfirm', '1');
        } else {
          localStorage.removeItem('skipClearConfirm');
        }
      }
      resolve(result);
    }
    function onOk() {
      cleanup({ confirmed: true, domainOnly: showDomainOption && domainCb.checked });
    }
    function onCancel() { cleanup({ confirmed: false, domainOnly: false }); }
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
  });
}

// ============================================================
// 工具函数
// ============================================================
function getMethodClass(method) {
  const m = (method || '').toUpperCase();
  if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(m)) {
    return `method-${m}`;
  }
  return 'method-DEFAULT';
}

function getStatusClass(code) {
  if (code >= 200 && code < 300) return 'status-2xx';
  if (code >= 300 && code < 400) return 'status-3xx';
  if (code >= 400 && code < 500) return 'status-4xx';
  if (code >= 500) return 'status-5xx';
  return 'status-0';
}

function truncateUrl(url) {
  try {
    const u = new URL(url);
    let path = u.pathname;
    if (path.length > 60) {
      path = path.substring(0, 40) + '...' + path.substring(path.length - 15);
    }
    return u.origin + path + u.search.substring(0, 30);
  } catch {
    return url.length > 80 ? url.substring(0, 77) + '...' : url;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function truncatePageTitle(title) {
  if (!title) return '';
  return title.length > 30 ? title.substring(0, 27) + '...' : title;
}

// 星标状态持久化
function saveStarredState() {
  try {
    localStorage.setItem('starredRequests', JSON.stringify([...starredRequests]));
  } catch(e) {}
}

function loadStarredState() {
  try {
    const saved = localStorage.getItem('starredRequests');
    if (saved) {
      const arr = JSON.parse(saved);
      starredRequests = new Set(arr);
    }
  } catch(e) {}
}

// JSON 语法高亮
function formatJson(jsonStr) {
  if (!jsonStr) return '';
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    const formatted = JSON.stringify(obj, null, 2);
    return syntaxHighlightJson(formatted);
  } catch(e) {
    return escapeHtml(jsonStr);
  }
}

function syntaxHighlightJson(json) {
  // 只转义 < > & 避免破坏 HTML 结构，保留 " 供正则匹配
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: (null)/g, ': <span class="json-null">$1</span>');
}

function getBodyTypeLabel(type) {
  const map = {
    'formData': t('formData'),
    'raw': t('rawData'),
    'mixed': t('mixedData')
  };
  return map[type] || type || t('unknown');
}

const STATIC_TYPES = new Set(['image', 'stylesheet', 'script', 'font', 'media']);
const STATIC_EXT_RE = /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|map)(?:[?#].*)?$/i;
const DETAIL_STATE_KEY = 'requestCaptureDetailState';

function isStaticResource(type) {
  return STATIC_TYPES.has(type);
}

function isLikelyStaticRequest(req) {
  if (isStaticResource(req.type)) return true;
  try {
    return STATIC_EXT_RE.test(new URL(req.url).pathname);
  } catch(e) {
    return STATIC_EXT_RE.test(req.url || '');
  }
}

function requestPassesFilter(req) {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (filterTriggerOnly && !req.triggerInfo) return false;
  if (filterErrorsOnly && !(req.error || (req.statusCode >= 400))) return false;
  if (filterSlowOnly && (req.duration == null || req.duration <= 1000)) return false;
  if (filterStaticResources && isLikelyStaticRequest(req)) return false;
  if (filterStarredOnly && !starredRequests.has(req.id)) return false;
  if (selectedDomain && extractDomain(req.url) !== selectedDomain) return false;
  if (selectedMethods.size > 0 && !selectedMethods.has((req.method || '').toUpperCase())) return false;
  if (searchTerm) {
    if (req.url.toLowerCase().includes(searchTerm)) return true; // early out
    if (String(req.statusCode).includes(searchTerm)) return true;
    if ((req.method || '').toLowerCase().includes(searchTerm)) return true;
    if ((req.pageTitle || '').toLowerCase().includes(searchTerm)) return true;
    if (req.triggerInfo) {
      if ((req.triggerInfo.text || '').toLowerCase().includes(searchTerm)) return true;
      if ((req.triggerInfo.ariaLabel || '').toLowerCase().includes(searchTerm)) return true;
      if ((req.triggerInfo.selector || '').toLowerCase().includes(searchTerm)) return true;
    }
    // 搜索请求头值
    if (req.requestHeaders) {
      for (const h of req.requestHeaders) {
        if (h.value.toLowerCase().includes(searchTerm)) return true;
      }
    }
    // 搜索请求体（仅文本类型，限制大小防止卡顿）
    if (req.requestBody && req.requestBody.raw && req.requestBody.raw.length < 10000) {
      if (req.requestBody.raw.toLowerCase().includes(searchTerm)) return true;
    }
    if (req.requestBody && typeof req.requestBody.data === 'string' && req.requestBody.data.length < 10000) {
      if (req.requestBody.data.toLowerCase().includes(searchTerm)) return true;
    }
    return false;
  }
  return true;
}

// ============================================================
// 统计概览计算
// ============================================================
function computeStatsSummary(requests) {
  const withDuration = requests.filter(r => r.duration != null);
  if (withDuration.length === 0) return '';

  const durations = withDuration.map(r => r.duration).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / durations.length);
  const p95Idx = Math.ceil(durations.length * 0.95) - 1;
  const p95 = durations[Math.min(p95Idx, durations.length - 1)];
  const slowCount = durations.filter(d => d > 1000).length;

  let stats = ` | ${t('avg', { value: avg })}`;
  if (p95 > 0) stats += ` | P95 ${p95}ms`;
  if (slowCount > 0) {
    stats += ` | <span class="footer-slow-count" title="${escapeHtml(t('slowTop5'))}">${t('slowCount', { count: slowCount })}</span>`;
  }
  return stats;
}

// ============================================================
// Top 5 慢请求浮层
// ============================================================
function showSlowTop5() {
  // 移除已存在的面板
  document.querySelector('.slow-top5-panel')?.remove();

  // 获取当前可见请求中耗时最长的 Top 5
  const visible = state.requests.filter(r => requestPassesFilter(r) && r.duration != null);
  const top5 = visible.sort((a, b) => b.duration - a.duration).slice(0, 5);
  if (top5.length === 0) return;

  const panel = document.createElement('div');
  panel.className = 'slow-top5-panel';

  let itemsHtml = '';
  top5.forEach((req, i) => {
    const methodClass = getMethodClass(req.method);
    const statusClass = getStatusClass(req.statusCode);
    const durationColor = req.duration > 3000 ? 'var(--accent-red)' : 'var(--accent-orange)';
    itemsHtml += `
      <div class="slow-top5-item" data-id="${req.id}">
        <span class="slow-top5-rank">#${i + 1}</span>
        <span class="method-badge ${methodClass}" style="width:36px;font-size:9px;">${req.method}</span>
        <span class="status-code ${statusClass}" style="width:28px;font-size:10px;">${req.statusCode || '-'}</span>
        <span class="slow-top5-duration" style="color:${durationColor}">${req.duration}ms</span>
        <span class="slow-top5-url" title="${escapeHtml(req.url)}">${escapeHtml(truncateUrl(req.url))}</span>
      </div>
    `;
  });

  panel.innerHTML = `
    <div class="slow-top5-header">
      <span>${t('slowTop5')}</span>
      <button class="slow-top5-close">&times;</button>
    </div>
    ${itemsHtml}
  `;

  // 插入到 footer 中
  const footer = document.querySelector('.footer');
  footer.appendChild(panel);

  // 点击关闭
  panel.querySelector('.slow-top5-close').addEventListener('click', (e) => {
    e.stopPropagation();
    panel.remove();
    document.removeEventListener('click', closePanel);
  });

  // 点击请求项打开详情
  panel.querySelectorAll('.slow-top5-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      const req = state.requests.find(r => r.id === id);
      if (req) {
        activeRequestId = req.id;
        document.querySelectorAll('.request-item.active').forEach(e => e.classList.remove('active'));
        const targetItem = document.querySelector(`.request-item[data-id="${id}"]`);
        if (targetItem) targetItem.classList.add('active');
        showDetail(req);
      }
      panel.remove();
    });
  });

  // 点击外部关闭
  const closePanel = (e) => {
    if (!panel.contains(e.target) && !e.target.closest('.footer-slow-count')) {
      panel.remove();
      document.removeEventListener('click', closePanel);
    }
  };
  setTimeout(() => document.addEventListener('click', closePanel), 10);
}
// ============================================================
function generateCurl(req, flat = false) {
  function esc(str) {
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\$/g, '\\$')
              .replace(/`/g, '\\`');
  }

  const method = req.method.toUpperCase();
  let curl = method === 'GET' ? 'curl' : `curl -X ${method}`;
  curl += ` "${esc(req.url)}"`;

  const separator = flat ? ' ' : ' \\\n  ';

  if (req.requestHeaders && req.requestHeaders.length > 0) {
    for (const h of req.requestHeaders) {
      const key = h.key.toLowerCase();
      if (key === 'content-length' || key.startsWith(':')) continue;
      curl += `${separator}-H "${esc(h.key)}: ${esc(h.value)}"`;
    }
  }

  if (req.requestBody && req.requestBody.data) {
    let bodyStr;
    if (req.requestBody.type === 'formData') {
      bodyStr = req.requestBody.raw || '';
    } else {
      bodyStr = typeof req.requestBody.data === 'string'
        ? req.requestBody.data
        : JSON.stringify(req.requestBody.data);
    }
    if (bodyStr) {
      curl += `${separator}-d "${esc(bodyStr)}"`;
    }
  }

  return curl;
}

// Windows 兼容的 cURL 命令（单行，适用于 cmd / PowerShell）
function generateCurlWindows(req) {
  function escWin(str) {
    // cmd/PowerShell 双引号内: "" 输出一个双引号
    return str.replace(/"/g, '""');
  }

  const method = req.method.toUpperCase();
  // 使用 curl.exe 避免 PowerShell 的 Invoke-WebRequest 别名冲突
  let curl = method === 'GET' ? 'curl.exe' : `curl.exe -X ${method}`;
  curl += ` "${escWin(req.url)}"`;

  if (req.requestHeaders && req.requestHeaders.length > 0) {
    for (const h of req.requestHeaders) {
      const key = h.key.toLowerCase();
      if (key === 'content-length' || key.startsWith(':')) continue;
      curl += ` -H "${escWin(h.key)}: ${escWin(h.value)}"`;
    }
  }

  if (req.requestBody && req.requestBody.data) {
    let bodyStr;
    if (req.requestBody.type === 'formData') {
      bodyStr = req.requestBody.raw || '';
    } else {
      bodyStr = typeof req.requestBody.data === 'string'
        ? req.requestBody.data
        : JSON.stringify(req.requestBody.data);
    }
    if (bodyStr) {
      curl += ` -d "${escWin(bodyStr)}"`;
    }
  }

  return curl;
}

// ============================================================
// Request Item DOM 创建
// ============================================================
function createRequestItemElement(req) {
  const isError = !!(req.error || (req.statusCode >= 400));
  const isActive = req.id === activeRequestId;
  const isSlow = req.duration > 1000;
  const isStarred = starredRequests.has(req.id);
  const isSelected = selectedIds.has(req.id);
  const item = document.createElement('div');
  item.className = `request-item${isError ? ' has-error' : ''}${isActive ? ' active' : ''}${isSlow ? ' is-slow' : ''}${isStarred ? ' is-starred' : ''}`;
  item.dataset.id = req.id;

  const method = (req.method || 'GET').toUpperCase();
  const statusClass = getStatusClass(req.statusCode);
  const methodClass = getMethodClass(method);

  // 合并列: 优先显示触发来源，无则显示页面标题，末尾附加时间
  const sourceText = req.triggerInfo
    ? '◉ ' + (req.triggerInfo.text || req.triggerInfo.ariaLabel || req.triggerInfo.selector || req.triggerInfo.tag)
    : (req.pageTitle || '');
  const timeSuffix = req.time ? ' ' + req.time : '';
  const displayText = (sourceText ? sourceText : '') + timeSuffix;
  const contextTitle = req.triggerInfo
    ? t('triggerSource') + ': ' + (req.triggerInfo.text || req.triggerInfo.ariaLabel || '') + '\n' + t('pageTitle') + ': ' + (req.pageTitle || '') + '\n' + t('time') + ': ' + (req.time || '')
    : (req.pageTitle || '') + '\n' + t('time') + ': ' + (req.time || '');

  // 搜索关键词高亮
  const searchTerm = searchInput.value.trim();
  let urlHtml = escapeHtml(truncateUrl(req.url));
  let ctxHtml = escapeHtml(truncatePageTitle(displayText) || '-');
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + escaped + ')', 'gi');
    urlHtml = urlHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
    ctxHtml = ctxHtml.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // 耗时徽标
  let durationHtml = '';
  if (req.duration != null) {
    const dClass = req.duration > 3000 ? 'slow' : req.duration > 1000 ? 'medium' : 'fast';
    durationHtml = `<span class="duration-badge duration-${dClass}">${req.duration}ms</span>`;
  } else {
    durationHtml = '<span class="duration-badge duration-na">-</span>';
  }

  item.innerHTML = `
    <input type="checkbox" class="request-checkbox" ${isSelected ? 'checked' : ''} />
    <span class="star-toggle${isStarred ? ' starred' : ''}" title="${isStarred ? t('unmarkRequest') : t('markRequest')}">${isStarred ? '★' : '☆'}</span>
    <span class="method-badge ${methodClass}">${method}</span>
    <span class="status-code ${statusClass}">${req.statusCode || '-'}</span>
    ${durationHtml}
    <span class="request-context" title="${escapeHtml(contextTitle)}">${ctxHtml}</span>
    <span class="request-url" title="${escapeHtml(req.url)}">${urlHtml}</span>
  `;

  item.addEventListener('click', (e) => {
    if (e.target.classList.contains('star-toggle')) return;
    if (e.target.classList.contains('request-checkbox')) return;
    activeRequestId = req.id;
    // 移除其他行的 active 状态
    document.querySelectorAll('.request-item.active').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    showDetail(req);
  });

  // 星标点击
  const starEl = item.querySelector('.star-toggle');
  starEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (starredRequests.has(req.id)) {
      starredRequests.delete(req.id);
      starEl.textContent = '☆';
      starEl.classList.remove('starred');
      starEl.title = t('markRequest');
      item.classList.remove('is-starred');
    } else {
      starredRequests.add(req.id);
      starEl.textContent = '★';
      starEl.classList.add('starred');
      starEl.title = t('unmarkRequest');
      item.classList.add('is-starred');
    }
    saveStarredState();
  });

  // 复选框点击
  const cb = item.querySelector('.request-checkbox');
  cb.addEventListener('change', (e) => {
    e.stopPropagation();
    if (cb.checked) {
      selectedIds.add(req.id);
    } else {
      selectedIds.delete(req.id);
    }
    updateSelectedCount();
  });

  return item;
}

// ============================================================
// 全量渲染 (搜索/筛选变化时使用)
// ============================================================
function renderRequests(requests) {
  let filtered = requests.filter(r => requestPassesFilter(r));

  if (filtered.length === 0) {
    requestList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${requests.length === 0 ? '<img class="empty-icon-img" src="icon48.png" alt="" />' : '⌕'}</div>
        <div class="empty-text">${requests.length === 0 ? t('emptyRequests') : t('noMatches')}</div>
        <div class="empty-hint">${requests.length === 0
          ? (state.isCapturing ? t('emptyHintCapturing') : t('emptyHintStopped'))
          : t('noMatchesHint')}</div>
      </div>
    `;
    footerInfo.innerHTML = t('totalRequests', { count: requests.length });
    return;
  }

  const groups = new Map();
  for (const req of filtered) {
    const domain = extractDomain(req.url);
    if (!groups.has(domain)) groups.set(domain, []);
    groups.get(domain).push(req);
  }

  const sortedDomains = [...groups.keys()].sort();
  const fragment = document.createDocumentFragment();

  for (const domain of sortedDomains) {
    const groupItems = groups.get(domain);
    const isExpanded = expandedDomains.has(domain);

    const group = document.createElement('div');
    group.className = 'domain-group';
    group.dataset.domain = domain;

    const header = document.createElement('div');
    header.className = 'domain-header';
    header.innerHTML = `
      <span class="domain-toggle ${isExpanded ? '' : 'collapsed'}">&#9660;</span>
      <span class="domain-name">${escapeHtml(domain)}</span>
      <span class="domain-count">${groupItems.length}</span>
    `;
    header.addEventListener('click', () => {
      if (expandedDomains.has(domain)) {
        expandedDomains.delete(domain);
      } else {
        expandedDomains.add(domain);
        // 展开时初始化虚拟滚动计数
        domainRenderCount.set(domain, PAGE_SIZE);
      }
      renderRequests(state.requests);
    });
    group.appendChild(header);

    if (isExpanded) {
      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'domain-items';
      const maxItems = Math.min(groupItems.length, domainRenderCount.get(domain) || PAGE_SIZE);
      for (let i = 0; i < maxItems; i++) {
        itemsContainer.appendChild(createRequestItemElement(groupItems[i]));
      }
      group.appendChild(itemsContainer);

      // 如果还有更多未渲染，添加哨兵元素 (IntersectionObserver 触发加载 + 点击加载)
      if (maxItems < groupItems.length) {
        const sentinel = document.createElement('div');
        sentinel.className = 'virt-scroll-sentinel';
        sentinel.dataset.domain = domain;
        sentinel.innerHTML = `<span class="virt-scroll-hint">${t('loadMore')}</span>`;
        sentinel.addEventListener('click', () => {
          const current = domainRenderCount.get(domain) || PAGE_SIZE;
          domainRenderCount.set(domain, current + PAGE_SIZE);
          if (scrollObserver) scrollObserver.disconnect();
          scrollObserver = null;
          renderRequests(state.requests);
        });
        itemsContainer.appendChild(sentinel);
      } else if (groupItems.length > PAGE_SIZE) {
        // 全部已加载，显示计数
        const footer = document.createElement('div');
        footer.className = 'virt-scroll-footer';
        footer.textContent = t('entries', { count: groupItems.length });
        itemsContainer.appendChild(footer);
      }
    }

    fragment.appendChild(group);
  }

  requestList.replaceChildren(fragment);

  // 设置虚拟滚动 IntersectionObserver
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver((entries) => {
    let needsRender = false;
    for (const entry of entries) {
      if (entry.isIntersecting && entry.target.dataset.domain) {
        const domain = entry.target.dataset.domain;
        const current = domainRenderCount.get(domain) || PAGE_SIZE;
        domainRenderCount.set(domain, current + PAGE_SIZE);
        needsRender = true;
      }
    }
    if (needsRender) {
      scrollObserver.disconnect();
      scrollObserver = null;
      renderRequests(state.requests);
    }
  }, { root: requestList, rootMargin: '200px' });

  document.querySelectorAll('.virt-scroll-sentinel').forEach(el => {
    if (scrollObserver) scrollObserver.observe(el);
  });

  const stats = computeStatsSummary(filtered);
  footerInfo.innerHTML = t('showing', { visible: filtered.length, total: requests.length }) + stats;
}

// ============================================================
// 错误概览视图
// ============================================================
function normalizeErrorType(errorStr) {
  if (!errorStr) return t('unknownError');
  const e = errorStr.toUpperCase();
  if (e.includes('ERR_CONNECTION_REFUSED') || e.includes('CONNECTION REFUSED')) return currentLanguage === 'zh' ? '连接被拒绝' : 'Connection refused';
  if (e.includes('ERR_CONNECTION_RESET')) return currentLanguage === 'zh' ? '连接被重置' : 'Connection reset';
  if (e.includes('ERR_NAME_NOT_RESOLVED') || e.includes('NAME NOT RESOLVED')) return currentLanguage === 'zh' ? 'DNS 解析失败' : 'DNS lookup failed';
  if (e.includes('ERR_TIMEOUT') || e.includes('TIMEOUT') || e.includes('TIMED OUT')) return currentLanguage === 'zh' ? '请求超时' : 'Request timeout';
  if (e.includes('ERR_CONNECTION_CLOSED')) return currentLanguage === 'zh' ? '连接已关闭' : 'Connection closed';
  if (e.includes('ERR_ABORTED') || e.includes('ABORT')) return currentLanguage === 'zh' ? '请求被取消' : 'Request cancelled';
  if (e.includes('ERR_SSL') || e.includes('SSL')) return currentLanguage === 'zh' ? 'SSL 错误' : 'SSL error';
  if (e.includes('FAILED TO FETCH')) return currentLanguage === 'zh' ? 'Fetch 失败' : 'Fetch failed';
  if (e.includes('NETWORKERROR') || e.includes('NETWORK')) return currentLanguage === 'zh' ? '网络错误' : 'Network error';
  return errorStr.substring(0, 60);
}

function renderErrorOverview() {
  const errorRequests = state.requests.filter(r => r.error || (r.statusCode >= 400));
  if (errorRequests.length === 0) {
    requestList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <div class="empty-text">${t('noErrors')}</div>
        <div class="empty-hint">${t('allOk')}</div>
      </div>
    `;
    footerInfo.innerHTML = t('noErrorsFooter', { count: state.requests.length });
    return;
  }

  // 按状态码分组 (4xx/5xx)
  const statusGroups = new Map();
  // 按错误类型分组
  const errorTypeGroups = new Map();

  for (const r of errorRequests) {
    if (r.statusCode >= 400) {
      const key = String(r.statusCode);
      if (!statusGroups.has(key)) statusGroups.set(key, []);
      statusGroups.get(key).push(r);
    }
    if (r.error) {
      const key = normalizeErrorType(r.error);
      if (!errorTypeGroups.has(key)) errorTypeGroups.set(key, []);
      errorTypeGroups.get(key).push(r);
    }
  }

  const fragment = document.createDocumentFragment();

  // 顶部操作栏
  const actionBar = document.createElement('div');
  actionBar.className = 'error-overview-actions';
  actionBar.innerHTML = `
    <span class="error-overview-count">${t('errorOverviewCount', { count: errorRequests.length })}</span>
    <button class="btn btn-small btn-accent" id="btnCopyErrorSummary">${t('copyErrorSummary')}</button>
    <button class="btn btn-small btn-filter" id="btnBackFromErrors">← ${t('backToList')}</button>
  `;
  fragment.appendChild(actionBar);

  // 按状态码分组区域
  if (statusGroups.size > 0) {
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'error-section-title';
    sectionTitle.textContent = t('byStatus');
    fragment.appendChild(sectionTitle);

    const sortedStatusCodes = [...statusGroups.keys()].sort((a, b) => parseInt(b) - parseInt(a));
    for (const code of sortedStatusCodes) {
      const items = statusGroups.get(code);
      const isExpanded = expandedErrorGroups.has('status:' + code);
      const group = createErrorGroupElement('status:' + code, `HTTP ${code}`,
        `${code.startsWith('4') ? t('clientError') : t('serverError')} (${items.length})`,
        items, isExpanded, code);
      fragment.appendChild(group);
    }
  }

  // 按错误类型分组区域
  if (errorTypeGroups.size > 0) {
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'error-section-title';
    sectionTitle.textContent = t('byErrorType');
    fragment.appendChild(sectionTitle);

    const sortedErrorTypes = [...errorTypeGroups.keys()].sort((a, b) => errorTypeGroups.get(b).length - errorTypeGroups.get(a).length);
    for (const errType of sortedErrorTypes) {
      const items = errorTypeGroups.get(errType);
      const isExpanded = expandedErrorGroups.has('err:' + errType);
      const group = createErrorGroupElement('err:' + errType, errType,
        t('requestCount', { count: items.length }), items, isExpanded, null);
      fragment.appendChild(group);
    }
  }

  requestList.replaceChildren(fragment);

  // 绑定事件
  document.getElementById('btnCopyErrorSummary')?.addEventListener('click', () => {
    const summary = generateErrorSummary(errorRequests, statusGroups, errorTypeGroups);
    navigator.clipboard.writeText(summary).then(() => {
      showToast(t('errorSummaryCopied'));
    }).catch(() => {
      showToast(t('copyFailed'), true);
    });
  });

  document.getElementById('btnBackFromErrors')?.addEventListener('click', () => {
    errorOverviewMode = false;
    btnErrorOverview.classList.remove('active');
    errorOverviewText.textContent = t('error');
    searchInput.parentElement.style.display = 'flex';
    document.getElementById('batchBar').style.display = 'flex';
    renderRequests(state.requests);
  });

  // 展开/折叠 toggle 由 createErrorGroupElement 处理

  footerInfo.innerHTML = t('errorOverviewFooter', { errors: errorRequests.length, total: state.requests.length });
}

function createErrorGroupElement(key, title, subtitle, items, expanded, statusCode) {
  const group = document.createElement('div');
  group.className = 'error-group';
  group.dataset.key = key;

  const header = document.createElement('div');
  header.className = 'error-group-header';
  const errorCount = items.length;
  const statusColor = statusCode
    ? (parseInt(statusCode) >= 500 ? 'var(--accent-red)' : 'var(--accent-orange)')
    : 'var(--accent-purple)';
  header.innerHTML = `
    <span class="domain-toggle ${expanded ? '' : 'collapsed'}">&#9660;</span>
    <span class="error-group-badge" style="background:${statusColor}">${statusCode || '!'}</span>
    <span class="error-group-title">${escapeHtml(title)}</span>
    <span class="error-group-subtitle">${escapeHtml(subtitle)}</span>
    <span class="domain-count">${errorCount}</span>
  `;
  header.addEventListener('click', () => {
    if (expandedErrorGroups.has(key)) {
      expandedErrorGroups.delete(key);
    } else {
      expandedErrorGroups.add(key);
    }
    renderErrorOverview();
  });
  group.appendChild(header);

  if (expanded) {
    const container = document.createElement('div');
    container.className = 'error-group-items';
    for (const req of items) {
      container.appendChild(createRequestItemElement(req));
    }
    group.appendChild(container);
  }

  return group;
}

function generateErrorSummary(errorRequests, statusGroups, errorTypeGroups) {
  const now = new Date().toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
  let text = `=== ${currentLanguage === 'zh' ? '错误摘要' : 'Error Summary'} (${now}) ===\n`;
  text += `${t('errorOverviewCount', { count: errorRequests.length })}\n\n`;

  if (statusGroups && statusGroups.size > 0) {
    text += `[${t('byStatus')}]\n`;
    const sortedCodes = [...statusGroups.keys()].sort((a, b) => parseInt(b) - parseInt(a));
    for (const code of sortedCodes) {
      const items = statusGroups.get(code);
      const urls = items.map(r => r.method + ' ' + r.url).join('\n    ');
      text += `  HTTP ${code} (${items.length}):\n    ${urls}\n\n`;
    }
  }

  if (errorTypeGroups && errorTypeGroups.size > 0) {
    text += `[${t('byErrorType')}]\n`;
    const sortedTypes = [...errorTypeGroups.keys()].sort((a, b) => errorTypeGroups.get(b).length - errorTypeGroups.get(a).length);
    for (const errType of sortedTypes) {
      const items = errorTypeGroups.get(errType);
      const urls = items.map(r => r.method + ' ' + r.url).join('\n    ');
      text += `  ${errType} (${items.length}):\n    ${urls}\n\n`;
    }
  }

  // 慢错误 Top 5
  const withDuration = errorRequests.filter(r => r.duration != null).sort((a, b) => b.duration - a.duration).slice(0, 5);
  if (withDuration.length > 0) {
    text += `[Top 5 ${currentLanguage === 'zh' ? '慢错误' : 'slow errors'}]\n`;
    for (const r of withDuration) {
      text += `  ${r.method} ${truncateUrl(r.url)} (${r.statusCode || '-'}) ${r.duration}ms\n`;
    }
    text += '\n';
  }

  return text;
}

// ============================================================
// 操作/API 映射视图
// ============================================================
let expandedCallChains = new Set();

function getModuleKey(req) {
  if (req.pageUrl) {
    try {
      const u = new URL(req.pageUrl);
      return `${u.hostname}${u.pathname}`;
    } catch(e) {
      return req.pageUrl;
    }
  }
  return extractDomain(req.url);
}

function getModuleLabel(req) {
  const title = (req.pageTitle || '').trim();
  if (title) return truncatePageTitle(title);
  try {
    const u = new URL(req.pageUrl || req.url);
    const lastPath = u.pathname.split('/').filter(Boolean).pop();
    return lastPath || u.hostname;
  } catch(e) {
    return t('unknownPage');
  }
}

function getOperationLabel(trigger) {
  if (!trigger) return t('untraced');
  const label = (trigger.text || trigger.ariaLabel || trigger.title || trigger.name || trigger.selector || trigger.tag || '').trim();
  return label || t('clickAction');
}

function getOperationKey(trigger) {
  if (!trigger) return '__untraced__';
  return [
    getOperationLabel(trigger),
    trigger.id || '',
    trigger.name || '',
    trigger.role || '',
    trigger.selector || ''
  ].join('|');
}

function buildOperationApiMap(requests) {
  const moduleMap = new Map();
  const traceMap = new Map();
  let tracedRequestCount = 0;
  let untracedRequestCount = 0;

  for (const req of requests) {
    if (req.traceId) {
      if (!traceMap.has(req.traceId)) traceMap.set(req.traceId, []);
      traceMap.get(req.traceId).push(req);
      tracedRequestCount++;
    } else {
      addOperationRequest(moduleMap, req, null, null);
      untracedRequestCount++;
    }
  }

  for (const [traceId, reqs] of traceMap) {
    reqs.sort((a, b) => (a.traceSequence || 0) - (b.traceSequence || 0));
    const triggerReq = reqs.find(r => r.triggerInfo) || reqs[0];
    const trigger = triggerReq ? triggerReq.triggerInfo : null;
    for (const req of reqs) {
      addOperationRequest(moduleMap, req, trigger, traceId);
    }
  }

  const modules = [...moduleMap.values()].map(module => {
    module.operations = [...module.operationMap.values()]
      .map(op => {
        op.requests.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0) || (a.traceSequence || 0) - (b.traceSequence || 0));
        op.traceCount = op.traceIds.size;
        op.latestTime = Math.max(...op.requests.map(r => r.timestamp || 0));
        return op;
      })
      .sort((a, b) => {
        if (a.isUntraced !== b.isUntraced) return a.isUntraced ? 1 : -1;
        return (b.latestTime || 0) - (a.latestTime || 0);
      });
    module.requestCount = module.operations.reduce((sum, op) => sum + op.requests.length, 0);
    module.operationCount = module.operations.filter(op => !op.isUntraced).length;
    module.latestTime = Math.max(...module.operations.map(op => op.latestTime || 0));
    delete module.operationMap;
    return module;
  }).sort((a, b) => (b.latestTime || 0) - (a.latestTime || 0));

  return {
    modules,
    operationCount: modules.reduce((sum, m) => sum + m.operationCount, 0),
    tracedRequestCount,
    untracedRequestCount
  };
}

function addOperationRequest(moduleMap, req, trigger, traceId) {
  const moduleKey = getModuleKey(req);
  let module = moduleMap.get(moduleKey);
  if (!module) {
    module = {
      key: moduleKey,
      label: getModuleLabel(req),
      url: req.pageUrl || '',
      operationMap: new Map()
    };
    moduleMap.set(moduleKey, module);
  }

  const opKey = getOperationKey(trigger);
  let operation = module.operationMap.get(opKey);
  if (!operation) {
    operation = {
      key: opKey,
      label: getOperationLabel(trigger),
      trigger,
      isUntraced: !trigger,
      requests: [],
      traceIds: new Set()
    };
    module.operationMap.set(opKey, operation);
  }
  operation.requests.push(req);
  if (traceId) operation.traceIds.add(traceId);
}

function renderChainItemList(requests, container) {
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    const seq = i + 1;

    const itemEl = document.createElement('div');
    itemEl.className = 'call-chain-item';
    itemEl.dataset.id = req.id;

    const methodClass = getMethodClass(req.method);
    const statusClass = getStatusClass(req.statusCode);
    const method = (req.method || 'GET').toUpperCase();

    const durationStr = req.duration != null
      ? `<span class="chain-duration ${req.duration > 3000 ? 'duration-slow' : req.duration > 1000 ? 'duration-medium' : 'duration-fast'}">${req.duration}ms</span>`
      : '';

    const seqColor = seq === 1 ? 'var(--accent-teal)' : 'var(--text-muted)';

    itemEl.innerHTML = `
      <span class="chain-sequence" style="color:${seqColor}">#${seq}</span>
      <span class="method-badge ${methodClass}" style="width:36px;font-size:9px;">${method}</span>
      <span class="status-code ${statusClass}" style="width:28px;font-size:10px;">${req.statusCode || '-'}</span>
      <span class="request-url" style="font-size:11px;" title="${escapeHtml(req.url)}">${escapeHtml(truncateUrl(req.url))}</span>
      ${durationStr}
    `;

    itemEl.addEventListener('click', () => {
      activeRequestId = req.id;
      document.querySelectorAll('.request-item.active, .call-chain-item.active').forEach(el => el.classList.remove('active'));
      itemEl.classList.add('active');
      showDetail(req);
    });

    container.appendChild(itemEl);
  }
}

function renderCallChainView() {
  const filtered = state.requests.filter(r => requestPassesFilter(r));
  if (filtered.length === 0) {
    requestList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⛓</div>
        <div class="empty-text">${t('operationEmpty')}</div>
        <div class="empty-hint">${t('operationHint')}</div>
      </div>
    `;
    footerInfo.innerHTML = t('totalRequests', { count: state.requests.length });
    return;
  }

  const { modules, operationCount, tracedRequestCount, untracedRequestCount } = buildOperationApiMap(filtered);

  const fragment = document.createDocumentFragment();

  const hasExpandedModule = modules.some(module => expandedCallChains.has('module:' + module.key));
  if (!hasExpandedModule) {
    for (const module of modules.slice(0, 3)) {
      expandedCallChains.add('module:' + module.key);
      const firstOperation = module.operations.find(op => !op.isUntraced) || module.operations[0];
      if (firstOperation) {
        expandedCallChains.add('op:' + module.key + ':' + firstOperation.key);
      }
    }
  }

  const statsBar = document.createElement('div');
  statsBar.className = 'call-chain-stats';
  statsBar.innerHTML = `
    <span class="call-chain-stats-count">${t('pagesOpsRequests', { pages: modules.length, operations: operationCount, requests: tracedRequestCount })}</span>
    <span class="call-chain-stats-trigger">${t('untracedRequests', { count: untracedRequestCount })}</span>
  `;
  fragment.appendChild(statsBar);

  for (const module of modules) {
    const moduleExpandKey = 'module:' + module.key;
    const moduleExpanded = expandedCallChains.has(moduleExpandKey);
    const moduleEl = document.createElement('div');
    moduleEl.className = 'call-chain-group operation-module';

    const moduleHeader = document.createElement('div');
    moduleHeader.className = 'call-chain-header operation-module-header';
    moduleHeader.innerHTML = `
      <span class="domain-toggle ${moduleExpanded ? '' : 'collapsed'}">&#9660;</span>
      <span class="call-chain-trigger" title="${escapeHtml(module.url || module.key)}">${escapeHtml(module.label)}</span>
      <span class="call-chain-meta">${t('operationsRequests', { operations: module.operationCount, requests: module.requestCount })}</span>
      <span class="domain-count">${module.requestCount}</span>
    `;
    moduleHeader.addEventListener('click', () => {
      if (expandedCallChains.has(moduleExpandKey)) {
        expandedCallChains.delete(moduleExpandKey);
      } else {
        expandedCallChains.add(moduleExpandKey);
      }
      renderCallChainView();
    });
    moduleEl.appendChild(moduleHeader);

    if (moduleExpanded) {
      const operationsEl = document.createElement('div');
      operationsEl.className = 'operation-list';
      for (const operation of module.operations) {
        const opExpandKey = 'op:' + module.key + ':' + operation.key;
        const opExpanded = expandedCallChains.has(opExpandKey);
        const opEl = document.createElement('div');
        opEl.className = `operation-group${operation.isUntraced ? ' operation-untraced' : ''}`;

        const opHeader = document.createElement('div');
        opHeader.className = 'call-chain-header operation-header';
        const triggerTitle = operation.trigger
          ? [
              operation.trigger.selector || '',
              operation.trigger.id ? 'id=' + operation.trigger.id : '',
              operation.trigger.role ? 'role=' + operation.trigger.role : ''
            ].filter(Boolean).join('\n')
          : t('noMatchedClick');
        opHeader.innerHTML = `
          <span class="domain-toggle ${opExpanded ? '' : 'collapsed'}">&#9660;</span>
          <span class="operation-name" title="${escapeHtml(triggerTitle)}">${escapeHtml(operation.label)}</span>
          <span class="call-chain-meta">${operation.isUntraced ? t('unassociated') : t('clickCount', { count: operation.traceCount })} · ${t('requestCount', { count: operation.requests.length })}</span>
          <span class="domain-count">${operation.requests.length}</span>
        `;
        opHeader.addEventListener('click', () => {
          if (expandedCallChains.has(opExpandKey)) {
            expandedCallChains.delete(opExpandKey);
          } else {
            expandedCallChains.add(opExpandKey);
          }
          renderCallChainView();
        });
        opEl.appendChild(opHeader);

        if (opExpanded) {
          const container = document.createElement('div');
          container.className = 'call-chain-items operation-requests';
          renderChainItemList(operation.requests, container);
          opEl.appendChild(container);
        }

        operationsEl.appendChild(opEl);
      }
      moduleEl.appendChild(operationsEl);
    }

    fragment.appendChild(moduleEl);
  }

  requestList.replaceChildren(fragment);
  footerInfo.innerHTML = t('operationFooter', { operations: operationCount, traced: tracedRequestCount, untraced: untracedRequestCount });
}


// ============================================================
// 增量追加新请求 (流式推送)
// ============================================================
function appendNewRequest(request, domain) {
  // 清除空状态元素（如果存在）
  const emptyState = requestList.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  // 查找或创建域名分组
  let groupEl = requestList.querySelector(`.domain-group[data-domain="${CSS.escape(domain)}"]`);

  if (!groupEl) {
    // 创建新域名分组
    groupEl = document.createElement('div');
    groupEl.className = 'domain-group';
    groupEl.dataset.domain = domain;

    const header = document.createElement('div');
    header.className = 'domain-header';
    header.innerHTML = `
      <span class="domain-toggle">&#9660;</span>
      <span class="domain-name">${escapeHtml(domain)}</span>
      <span class="domain-count">1</span>
    `;
    header.addEventListener('click', () => {
      if (expandedDomains.has(domain)) {
        expandedDomains.delete(domain);
      } else {
        expandedDomains.add(domain);
      }
      renderRequests(state.requests);
    });

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'domain-items';

    groupEl.appendChild(header);
    groupEl.appendChild(itemsContainer);

    // 按字母序插入
    const allGroups = [...requestList.querySelectorAll('.domain-group')];
    let insertBefore = null;
    for (const g of allGroups) {
      if (g.dataset.domain > domain) {
        insertBefore = g;
        break;
      }
    }
    requestList.insertBefore(groupEl, insertBefore);
  } else {
    // 更新域名计数
    const countEl = groupEl.querySelector('.domain-count');
    countEl.textContent = parseInt(countEl.textContent) + 1;
  }

  // 如果域名已展开且请求通过当前筛选，检查虚拟滚动限制后追加到DOM
  if (expandedDomains.has(domain) && requestPassesFilter(request)) {
    const currentCount = domainRenderCount.get(domain) || PAGE_SIZE;
    const itemsContainer = groupEl.querySelector('.domain-items');
    if (itemsContainer) {
      const existingItems = itemsContainer.querySelectorAll('.request-item').length;
      if (existingItems < currentCount) {
        itemsContainer.appendChild(createRequestItemElement(request));
      }
    }
  }
}

// ============================================================
// 详情面板
// ============================================================
let detailPanel = null;
let currentDetailReq = null;
let activeDrawerTab = 'info';
let lastReplayResponse = null; // 最近一次转发结果

function persistDetailState() {
  if (!currentDetailReq) return;
  try {
    localStorage.setItem(DETAIL_STATE_KEY, JSON.stringify({
      open: true,
      requestId: currentDetailReq.id,
      activeDrawerTab
    }));
  } catch(e) {}
}

function clearDetailState() {
  try {
    localStorage.removeItem(DETAIL_STATE_KEY);
  } catch(e) {}
}

function restoreDetailState() {
  if (currentDetailReq) return;
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(DETAIL_STATE_KEY) || 'null');
  } catch(e) {}
  if (!saved || !saved.open || !saved.requestId) return;

  activeDrawerTab = saved.activeDrawerTab || 'info';
  const localReq = state.requests.find(r => r.id === saved.requestId);
  if (localReq) {
    activeRequestId = localReq.id;
    showDetail(localReq);
    return;
  }

  chrome.runtime.sendMessage({ type: 'GET_REQUEST_DETAIL', id: saved.requestId }, (response) => {
    if (response && response.request && !currentDetailReq) {
      activeRequestId = response.request.id;
      showDetail(response.request);
    }
  });
}

function showDetail(req) {
  activeRequestId = req.id;
  currentDetailReq = req;
  // 切换请求时，如果新请求不是上次转发的那个，清除转发结果
  if (lastReplayResponse && lastReplayResponse._forRequestId !== req.id) {
    lastReplayResponse = null;
  }
  const drawer = document.getElementById('detailDrawer');

  // Update title
  const methodClass = getMethodClass(req.method);
  const statusClass = getStatusClass(req.statusCode);
  drawerMethodBadge.className = `method-badge ${methodClass}`;
  drawerMethodBadge.textContent = req.method || 'GET';
  drawerStatus.className = statusClass;
  drawerStatus.textContent = req.statusCode || '-';

  // Populate all sections
  updateDrawerSection(req);

  // Open drawer
  document.querySelectorAll('.request-item.active, .call-chain-item.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`.request-item[data-id="${req.id}"], .call-chain-item[data-id="${req.id}"]`).forEach(el => el.classList.add('active'));
  drawer.classList.add('open');
  requestList.classList.add('drawer-open');
  detailPanel = drawer;
  persistDetailState();
}

function updateDrawerSection(req) {
  if (!req) return;
  renderDrawerInfo(req);
  renderDrawerHeaders(req);
  renderDrawerBody(req);
  renderDrawerResponse(req);
  renderDrawerTrigger(req);
  activateDrawerTab(activeDrawerTab);
}

function renderDrawerInfo(req) {

  let html = `
    <div class="drawer-section">
      <div class="drawer-section-title">${t('requestUrl')}</div>
      <div class="drawer-url-box">${escapeHtml(req.url)}</div>
    </div>
  `;

  // 重定向链
  if (req.redirected && req.redirectChain && req.redirectChain.length > 0) {
    html += `<div class="drawer-section"><div class="drawer-section-title">${t('redirectChain')}</div>`;
    req.redirectChain.forEach((url, i) => {
      html += `<div class="drawer-url-box" style="margin-bottom:4px;font-size:10px;">${i + 1}. ${escapeHtml(url)}</div>`;
    });
    html += `<div class="drawer-url-box" style="background:var(--bg-hover);font-size:10px;">→ ${escapeHtml(req.url)}</div></div>`;
  }

  // 查询参数
  if (req.parsedUrl && req.parsedUrl.query && req.parsedUrl.query.length > 0) {
    html += `<div class="drawer-section"><div class="drawer-section-title">${t('queryParams')}</div><table class="drawer-table">`;
    req.parsedUrl.query.forEach(q => {
      html += `<tr><th>${escapeHtml(q.key)}</th><td>${escapeHtml(q.value)}</td></tr>`;
    });
    html += `</table></div>`;
  }

  // 基本信息
  html += `<div class="drawer-section"><div class="drawer-section-title">${t('basicInfo')}</div><table class="drawer-table">
    <tr><th>${t('method')}</th><td>${req.method || '-'}</td></tr>
    <tr><th>${t('statusCode')}</th><td>${req.statusCode || '-'} ${req.statusLine ? escapeHtml(req.statusLine) : ''}</td></tr>
    <tr><th>${t('type')}</th><td>${req.type || '-'}</td></tr>
    <tr><th>${t('time')}</th><td>${req.time || '-'}</td></tr>`;
  if (req.duration != null) {
    const dColor = req.duration > 3000 ? 'var(--accent-red)' : req.duration > 1000 ? 'var(--accent-orange)' : 'var(--accent-green)';
    html += `<tr><th>${t('duration')}</th><td style="font-weight:600;color:${dColor}">${req.duration}ms</td></tr>`;
  }
  if (req.pageTitle) html += `<tr><th>${t('pageTitle')}</th><td title="${escapeHtml(req.pageTitle)}">${escapeHtml(truncatePageTitle(req.pageTitle))}</td></tr>`;
  if (req.pageUrl) html += `<tr><th>${t('pageUrl')}</th><td style="font-size:10px;">${escapeHtml(req.pageUrl)}</td></tr>`;
  if (req.error) html += `<tr><th>${t('error')}</th><td style="color:var(--accent-red)">${escapeHtml(req.error)}</td></tr>`;
  html += `</table></div>`;

  drawerSectionInfo.innerHTML = html;
}

function renderDrawerHeaders(req) {
  if (req.requestHeaders && req.requestHeaders.length > 0) {
    let html = `<table class="drawer-table">`;
    req.requestHeaders.forEach(h => {
      html += `<tr><th>${escapeHtml(h.key)}</th><td>${escapeHtml(h.value)}</td></tr>`;
    });
    html += `</table>`;
    drawerSectionHeaders.innerHTML = html;
  } else {
    drawerSectionHeaders.innerHTML = `<div class="drawer-body-box" style="color:var(--text-muted)">${t('noRequestHeaders')}</div>`;
  }
}

function renderDrawerBody(req) {
  if (req.requestBody && req.requestBody.data) {
    let bodyStr;
    if (req.requestBody.type === 'formData') {
      bodyStr = req.requestBody.raw || JSON.stringify(req.requestBody.data, null, 2);
    } else {
      bodyStr = typeof req.requestBody.data === 'string'
        ? req.requestBody.data
        : JSON.stringify(req.requestBody.data, null, 2);
    }
    // 尝试格式化 JSON
    let formatted = formatJson(bodyStr);
    if (!formatted) formatted = escapeHtml(bodyStr);
    drawerSectionBody.innerHTML = `
      <div class="drawer-section-title">${t('requestBodyWithType', { type: getBodyTypeLabel(req.requestBody.type) })}</div>
      <div class="drawer-body-box">${formatted}</div>
    `;
  } else {
    drawerSectionBody.innerHTML = `<div class="drawer-body-box" style="color:var(--text-muted)">${t('noRequestBody')}</div>`;
  }
}

function renderDrawerResponse(req) {
  let html = '';
  if (req.responseHeaders && req.responseHeaders.length > 0) {
    html += `<table class="drawer-table">`;
    req.responseHeaders.forEach(h => {
      html += `<tr><th>${escapeHtml(h.key)}</th><td>${escapeHtml(h.value)}</td></tr>`;
    });
    html += `</table>`;
  } else {
    html += `<div class="drawer-body-box" style="color:var(--text-muted)">${t('noResponseHeaders')}</div>`;
  }
  // 追加转发结果
  if (lastReplayResponse) {
    html += `<div class="drawer-section-title" style="margin-top:12px;">${t('replayResult')}</div>`;
    html += `<div class="drawer-body-box" style="background:var(--bg-hover);font-size:11px;">`;
    html += `<div>${t('status')}: ${lastReplayResponse.status} ${lastReplayResponse.statusText}</div>`;
    if (lastReplayResponse.body) {
      html += `<pre style="margin:4px 0 0;white-space:pre-wrap;word-break:break-all;font-size:10px;">${escapeHtml(lastReplayResponse.body)}</pre>`;
    }
    html += `</div>`;
  }
  drawerSectionResponse.innerHTML = html;
}

function renderDrawerTrigger(req) {
  if (!req.triggerInfo) {
    drawerSectionTrigger.innerHTML = `<div class="drawer-body-box" style="color:var(--text-muted)">${t('noTriggerInfo')}</div>`;
    return;
  }
  const ti = req.triggerInfo;
  const elementTypeIcon = {
    'a': '🔗', 'button': '🔘', 'input': '📝', 'select': '📋',
    'summary': '📂', 'option': '☑️', 'img': '🖼️'
  }[ti.tag] || '🖱';
  let html = `<table class="drawer-table">
    <tr><th>${t('elementType')}</th><td>${elementTypeIcon} &lt;${escapeHtml(ti.tag)}&gt;</td></tr>`;
  if (ti.text) html += `<tr><th>${t('elementText')}</th><td style="font-weight:600;color:var(--accent-blue)">${escapeHtml(ti.text)}</td></tr>`;
  if (ti.role) html += `<tr><th>${t('role')}</th><td>${escapeHtml(ti.role)}</td></tr>`;
  if (ti.ariaLabel) html += `<tr><th>${t('ariaLabel')}</th><td>${escapeHtml(ti.ariaLabel)}</td></tr>`;
  if (ti.id) html += `<tr><th>${t('elementId')}</th><td><code>${escapeHtml(ti.id)}</code></td></tr>`;
  html += `<tr><th>${t('selector')}</th><td><code>${escapeHtml(ti.selector)}</code></td></tr>`;
  if (ti.href) html += `<tr><th>${t('linkHref')}</th><td><code>${escapeHtml(ti.href)}</code></td></tr>`;
  if (ti.type) html += `<tr><th>${t('inputType')}</th><td>${escapeHtml(ti.type)}</td></tr>`;
  if (ti.name) html += `<tr><th>${t('elementName')}</th><td>${escapeHtml(ti.name)}</td></tr>`;
  if (req.triggerDelay != null) html += `<tr><th>${t('triggerDelay')}</th><td>${req.triggerDelay}ms</td></tr>`;
  html += `</table>`;
  drawerSectionTrigger.innerHTML = html;
}

function activateDrawerTab(tabName) {
  activeDrawerTab = tabName;
  document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#drawerBody > .drawer-section').forEach(s => s.style.display = 'none');
  const tab = document.querySelector(`.drawer-tab[data-tab="${tabName}"]`);
  if (tab) tab.classList.add('active');
  const sectionMap = {
    'info': 'drawerSectionInfo',
    'headers': 'drawerSectionHeaders',
    'body': 'drawerSectionBody',
    'response': 'drawerSectionResponse',
    'trigger': 'drawerSectionTrigger'
  };
  const sectionId = sectionMap[tabName];
  if (sectionId) {
    document.getElementById(sectionId).style.display = 'block';
  }
  persistDetailState();
}

function closeDetail() {
  const drawer = document.getElementById('detailDrawer');
  drawer.classList.remove('open');
  requestList.classList.remove('drawer-open');
  // 清除拖拽留下的内联样式，恢复 CSS 默认值
  drawer.style.height = '';
  requestList.style.paddingBottom = '';
  activeRequestId = null;
  detailPanel = null;
  currentDetailReq = null;
  lastReplayResponse = null;
  clearDetailState();
}

// ============================================================
// 导出
// ============================================================
function exportSelected(requests) {
  if (requests.length === 0) {
    showToast(t('noSelectedRequests'), true);
    return;
  }

  exportRequests({
    ids: requests.map(r => r.id),
    summarySource: requests
  });
}

function getExportFormatMeta() {
  const format = exportFormat.value;
  switch (format) {
    case 'har':
      return { messageType: 'EXPORT_HAR', formatLabel: 'HAR' };
    case 'newman':
      return { messageType: 'EXPORT_NEWMAN', formatLabel: currentLanguage === 'zh' ? 'Newman CI 脚本' : 'Newman CI scripts' };
    default:
      return { messageType: 'EXPORT', formatLabel: 'Postman Collection' };
  }
}

function exportRequests({ ids, summarySource, onSuccess }) {
  const { messageType, formatLabel } = getExportFormatMeta();
  const message = { type: messageType };
  if (ids && ids.length > 0) message.ids = ids;

  chrome.runtime.sendMessage(message, (response) => {
    if (response && response.success) {
      showToast(t('exportDoneToast', { format: formatLabel }));
      showExportModal(formatLabel, summarySource, response.summary);
      if (onSuccess) onSuccess(response);
    } else {
      showToast(t('exportFailed', { error: response?.error || t('unknownError') }), true);
    }
  });
}

function showExportModal(formatLabel, requests, summary) {
  const methodCounts = {};
  let requestCount = 0;
  let domainCount = 0;
  let errorCount = 0;

  if (summary) {
    Object.assign(methodCounts, summary.methodCounts || {});
    requestCount = summary.requestCount || 0;
    domainCount = summary.domainCount || 0;
    errorCount = summary.errorCount || 0;
  } else {
    const domains = new Set();
    for (const r of requests || []) {
      const m = (r.method || 'GET').toUpperCase();
      methodCounts[m] = (methodCounts[m] || 0) + 1;
      domains.add(extractDomain(r.url));
      if (r.statusCode >= 400 || r.error) errorCount++;
    }
    requestCount = (requests || []).length;
    domainCount = domains.size;
  }

  const methodStats = Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([m, c]) => `${m} ${c}`)
    .join(' · ');

  const dateStr = new Date().toLocaleString('zh-CN');
  exportModalBody.innerHTML = `
    <div class="stat-row"><span class="label">${t('format')}</span><span class="value">${formatLabel}</span></div>
    <div class="stat-row"><span class="label">${t('requests')}</span><span class="value">${requestCount}</span></div>
    <div class="stat-row"><span class="label">${t('domains')}</span><span class="value">${domainCount}</span></div>
    <div class="stat-row"><span class="label">${t('methodStats')}</span><span class="value">${methodStats || '-'}</span></div>
    ${errorCount > 0 ? `<div class="stat-row"><span class="label">${t('errorRequests')}</span><span class="value" style="color:var(--accent-red)">${errorCount}</span></div>` : ''}
    <hr class="stat-divider" />
    <div class="stat-row"><span class="label">${t('exportedAt')}</span><span class="value">${dateStr}</span></div>
  `;
  exportModal.style.display = 'flex';
}

// ============================================================
// 流式推送: 端口连接与消息处理
// ============================================================

function handleInit(data) {
  // 防御：如果 INIT 返回空数据，但本地已有请求且仍在捕获中，
  // 说明可能是 SW 重启后状态未完整恢复，保留本地数据避免列表闪清。
  const incomingEmpty = (!data.requests || data.requests.length === 0);
  const localHasData = (state.requests && state.requests.length > 0);
  if (incomingEmpty && localHasData && state.isCapturing) {
    console.log('[POPUP] handleInit: incoming data is empty but local has', state.requests.length, 'requests and isCapturing=true, keeping local state');
    state.isCapturing = data.isCapturing;
    state.total = data.total;
    updateUI();
    return;
  }

  state = {
    isCapturing: data.isCapturing,
    total: data.total,
    requests: data.requests || []
  };

  updateUI();

  // 自动展开请求数最多的前 5 个域名
  expandedDomains.clear();
  const domainCounts = new Map();
  for (const r of state.requests) {
    const d = extractDomain(r.url);
    domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
  }
  const topDomains = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);
  for (const d of topDomains) {
    expandedDomains.add(d);
    domainRenderCount.set(d, PAGE_SIZE);
  }

  renderRequests(state.requests);
  restoreDetailState();
}

function handleNewRequest(request) {
  // 防呆：如果前端当前显示的是"已停止"，无视新来的请求
  if (!state.isCapturing) return;

  // 更新状态
  state.requests.push(request);
  state.total = state.total + 1;

  // 更新顶部计数
  countBadge.textContent = t('requestCount', { count: state.total });

  if (errorOverviewMode) {
    renderErrorOverview();
    return;
  }
  if (chainMode) {
    renderCallChainView();
    return;
  }

  // 展开该域名
  const domain = extractDomain(request.url);
  expandedDomains.add(domain);

  // 增量追加到DOM
  appendNewRequest(request, domain);

  // 更新底部统计（包含实时概览）
  const visibleRequests = state.requests.filter(r => requestPassesFilter(r));
  const stats = computeStatsSummary(visibleRequests);
  footerInfo.innerHTML = t('showing', { visible: visibleRequests.length, total: state.total }) + stats;
}

function connectPort() {
  try {
    popupPort = chrome.runtime.connect({ name: 'popup' });

    popupPort.onMessage.addListener((msg) => {
      switch (msg.type) {
        case 'INIT':
          // 用 GET_STATE 验证 INIT 的捕获状态（双 SW 实例可能导致 INIT 携带过期状态）
          chrome.runtime.sendMessage({ type: 'GET_STATE' }, (verify) => {
            if (verify) {
              if (verify.isCapturing !== msg.isCapturing) {
                console.log('[POPUP] INIT/GET_STATE mismatch: INIT=', msg.isCapturing, 'GET_STATE=', verify.isCapturing, 'using GET_STATE');
              }
              msg.isCapturing = verify.isCapturing;
              msg.total = verify.total;
            }
            handleInit(msg);
            initReceived = true;
          });
          break;
        case 'STATE_UPDATE':
          // 仅更新捕获状态和计数，不重新渲染列表（不调用 handleInit）
          state.isCapturing = msg.isCapturing;
          state.total = msg.total;
          updateUI();
          break;
        case 'NEW_REQUEST':
          handleNewRequest(msg.request);
          break;
      }
    });

    popupPort.onDisconnect.addListener(() => {
      popupPort = null;
      // SW重启后尝试重连
      setTimeout(connectPort, 500);
    });
  } catch (e) {
    // 连接失败，稍后重试
    setTimeout(connectPort, 1000);
  }
}

// ============================================================
// 保底轮询 (每5秒，仅端口断开时使用)
// ============================================================
function startFallbackPoll() {
  stopFallbackPoll();
  fallbackInterval = setInterval(() => {
    if (popupPort) return; // 推送正常，跳过轮询
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (!response) return;
      // 始终更新捕获状态和计数（不依赖 requests 是否存在）
      state.isCapturing = response.isCapturing;
      state.total = response.total;
      updateUI();
      // 有请求数据时才替换列表并重新渲染
      if (response.requests && response.requests.length > 0) {
        state.requests = response.requests;
        if (errorOverviewMode) {
          renderErrorOverview();
        } else if (chainMode) {
          renderCallChainView();
        } else {
          renderRequests(state.requests);
        }
        restoreDetailState();
      }
    });
  }, 5000);
}

function stopFallbackPoll() {
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
}

// ============================================================
// UI 更新
// ============================================================
function updateUI() {
  if (state.isCapturing) {
    statusBadge.textContent = t('capturing');
    statusBadge.classList.add('active');
    toggleIcon.textContent = '⏸';
    toggleText.textContent = t('stop');
    btnToggle.classList.remove('btn-primary');
    btnToggle.classList.add('btn-danger');
  } else {
    statusBadge.textContent = t('stopped');
    statusBadge.classList.remove('active');
    toggleIcon.textContent = '▶';
    toggleText.textContent = t('start');
    btnToggle.classList.remove('btn-danger');
    btnToggle.classList.add('btn-primary');
  }

  countBadge.textContent = t('requestCount', { count: state.total });

  if (state.total === 0) {
    if (state.isCapturing) {
      footerInfo.textContent = t('capturingHint');
    } else {
      footerInfo.textContent = t('clickStart');
    }
  }
  if (langToggle) langToggle.textContent = t('langButton');
}

// ============================================================
// 事件绑定
// ============================================================

if (langToggle) {
  langToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem(I18N_STORAGE_KEY, currentLanguage);
    applyStaticI18n();
    if (currentDetailReq) updateDrawerSection(currentDetailReq);
    if (errorOverviewMode) {
      renderErrorOverview();
    } else if (chainMode) {
      renderCallChainView();
    } else {
      renderRequests(state.requests);
    }
  });
}

// 启动/停止
btnToggle.addEventListener('click', () => {
  if (state.isCapturing) {
    chrome.runtime.sendMessage({ type: 'STOP' }, (response) => {
      if (response && response.success) {
        state.isCapturing = false;
        updateUI();
        showToast(t('stoppedToast'));
      }
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0] ? tabs[0].id : null;
      chrome.runtime.sendMessage({ type: 'START', tabId }, (response) => {
        if (response && response.success) {
          state.isCapturing = true;
          updateUI();
          showToast(t('startedToast'));
        }
      });
    });
  }
});

// 清空（带统计详情 + "不再提示" + "仅清空当前域名" 支持）
btnClear.addEventListener('click', async () => {
  if (state.total === 0) return;
  const currentDomain = selectedDomain;
  const hasDomainFilter = !!currentDomain;
  // 构造统计详情
  const clearCandidates = hasDomainFilter
    ? state.requests.filter(r => extractDomain(r.url) === currentDomain)
    : state.requests;
  const clearCount = hasDomainFilter ? clearCandidates.length : state.total;
  const errorCount = clearCandidates.filter(r => r.statusCode >= 400 || r.error).length;
  const triggerCount = clearCandidates.filter(r => r.triggerInfo).length;
  const chainCount = new Set(clearCandidates.filter(r => r.traceId).map(r => r.traceId)).size;
  const domainCount = hasDomainFilter ? 1 : new Set(state.requests.map(r => extractDomain(r.url))).size;
  confirmStats.innerHTML = `
    <div class="confirm-stats-item">${t('clearDelete', { count: `<span class="stat-value">${clearCount}</span>` })}</div>
    <div class="confirm-stats-item">${t('clearDomains', { count: `<span class="stat-value">${domainCount}</span>` })}</div>
    ${errorCount > 0 ? `<div class="confirm-stats-item">${t('clearErrors', { count: `<span class="stat-value" style="color:var(--accent-red)">${errorCount}</span>` })}</div>` : ''}
    ${triggerCount > 0 ? `<div class="confirm-stats-item">${t('clearTriggers', { count: `<span class="stat-value">${triggerCount}</span>` })}</div>` : ''}
    ${chainCount > 0 ? `<div class="confirm-stats-item">${t('clearChains', { count: `<span class="stat-value">${chainCount}</span>` })}</div>` : ''}
  `;
  confirmStats.style.display = 'block';
  const result = await showConfirm(t('clearPrompt'), true, hasDomainFilter);
  confirmStats.style.display = 'none';
  if (!result || !result.confirmed) return;
  if (result.domainOnly && hasDomainFilter) {
    chrome.runtime.sendMessage({ type: 'CLEAR_DOMAIN', domain: currentDomain }, (response) => {
      if (response && response.success) {
        state.requests = response.requests || state.requests.filter(r => extractDomain(r.url) !== currentDomain);
        state.total = response.total;
        if (currentDetailReq && extractDomain(currentDetailReq.url) === currentDomain) {
          closeDetail();
        }
        selectedIds.clear();
        selectedDomain = '';
        domainDropdownText.textContent = t('allDomains');
        expandedDomains.delete(currentDomain);
        domainRenderCount.delete(currentDomain);
        renderRequests(state.requests);
        updateUI();
        showToast(t('clearDomainToast', { domain: currentDomain }));
      } else {
        showToast(t('clearFailed', { error: response?.error || t('unknownError') }), true);
      }
    });
  } else {
    chrome.runtime.sendMessage({ type: 'CLEAR' }, (response) => {
      if (response && response.success) {
        state.requests = [];
        state.total = 0;
        expandedDomains.clear();
        domainRenderCount.clear();
        closeDetail();
        selectedIds.clear();
        renderRequests([]);
        updateUI();
        showToast(t('clearedToast'));
      }
    });
  }
});

// 导出全部
btnExport.addEventListener('click', () => {
  if (state.total === 0) {
    showToast(t('noExportRequests'), true);
    return;
  }
  exportRequests({ summarySource: state.requests });
});

// 导出并清空（先等导出完成再清空）
btnExportClear.addEventListener('click', () => {
  if (state.total === 0) {
    showToast(t('noExportRequests'), true);
    return;
  }
  exportRequests({
    summarySource: state.requests,
    onSuccess: () => {
      chrome.runtime.sendMessage({ type: 'CLEAR' }, (clearResp) => {
        if (clearResp && clearResp.success) {
          state.requests = [];
          state.total = 0;
          expandedDomains.clear();
          domainRenderCount.clear();
          closeDetail();
          selectedIds.clear();
          renderRequests([]);
          updateUI();
        }
      });
    }
  });
});

// 搜索防抖
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    renderRequests(state.requests);
  }, 200);
});

// 方法标签过滤
function updateMethodTagUI() {
  document.querySelectorAll('.method-tag').forEach(btn => {
    const method = btn.dataset.method;
    btn.classList.toggle('active', method === '' ? selectedMethods.size === 0 : selectedMethods.has(method));
  });
}

document.querySelectorAll('.method-tag').forEach(btn => {
  btn.addEventListener('click', () => {
    const method = btn.dataset.method;
    if (method === '') {
      selectedMethods.clear();
    } else {
      if (selectedMethods.has(method)) {
        selectedMethods.delete(method);
      } else {
        selectedMethods.add(method);
      }
    }
    updateMethodTagUI();
    renderRequests(state.requests);
  });
});

// 静态资源过滤
btnFilterStatic.addEventListener('click', () => {
  filterStaticResources = !filterStaticResources;
  btnFilterStatic.classList.toggle('active', filterStaticResources);
  filterIcon.textContent = filterStaticResources ? '█' : '■';
  filterText.textContent = filterStaticResources ? t('api') : t('all');
  renderRequests(state.requests);
});

// 触发来源过滤
btnFilterTrigger.addEventListener('click', () => {
  filterTriggerOnly = !filterTriggerOnly;
  btnFilterTrigger.classList.toggle('active', filterTriggerOnly);
  triggerFilterText.textContent = filterTriggerOnly ? t('triggered') : t('allRequests');
  renderRequests(state.requests);
});

// 异常请求过滤
btnFilterError.addEventListener('click', () => {
  filterErrorsOnly = !filterErrorsOnly;
  btnFilterError.classList.toggle('active', filterErrorsOnly);
  errorFilterText.textContent = filterErrorsOnly ? t('error') : t('all');
  renderRequests(state.requests);
});

// 慢请求过滤
btnFilterSlow.addEventListener('click', () => {
  filterSlowOnly = !filterSlowOnly;
  btnFilterSlow.classList.toggle('active', filterSlowOnly);
  slowFilterText.textContent = filterSlowOnly ? t('slow') : t('all');
  renderRequests(state.requests);
});

// 错误概览模式
btnErrorOverview.addEventListener('click', () => {
  errorOverviewMode = !errorOverviewMode;
  btnErrorOverview.classList.toggle('active', errorOverviewMode);
  if (errorOverviewMode) {
    errorOverviewText.textContent = t('overview');
    // 退出操作/API 映射模式
    if (chainMode) { chainMode = false; btnCallChain.classList.remove('active'); chainText.textContent = t('operationApi'); }
    searchInput.parentElement.style.display = 'none';
    document.getElementById('batchBar').style.display = 'none';
    renderErrorOverview();
  } else {
    errorOverviewText.textContent = t('error');
    searchInput.parentElement.style.display = 'flex';
    document.getElementById('batchBar').style.display = 'flex';
    renderRequests(state.requests);
  }
});

// 操作/API 映射模式
btnCallChain.addEventListener('click', () => {
  chainMode = !chainMode;
  btnCallChain.classList.toggle('active', chainMode);
  if (chainMode) {
    chainText.textContent = t('close');
    // 退出错误概览模式
    if (errorOverviewMode) { errorOverviewMode = false; btnErrorOverview.classList.remove('active'); errorOverviewText.textContent = t('error'); }
    searchInput.parentElement.style.display = 'none';
    document.getElementById('batchBar').style.display = 'none';
    renderCallChainView();
  } else {
    chainText.textContent = t('operationApi');
    searchInput.parentElement.style.display = 'flex';
    document.getElementById('batchBar').style.display = 'flex';
    renderRequests(state.requests);
  }
});

// 键盘导航（上下箭头切换请求）
document.addEventListener('keydown', (e) => {
  // 忽略输入框、文本域、下拉框中的方向键
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const selector = chainMode ? '.call-chain-item' : '.request-item';
    const items = requestList.querySelectorAll(selector);
    if (items.length === 0) return;
    let idx = -1;
    const current = activeRequestId;
    if (current) {
      for (let i = 0; i < items.length; i++) {
        if (parseInt(items[i].dataset.id) === current) { idx = i; break; }
      }
    }
    if (e.key === 'ArrowUp') {
      idx = idx > 0 ? idx - 1 : items.length - 1;
    } else {
      idx = idx < items.length - 1 ? idx + 1 : 0;
    }
    // 找到对应的 request 对象
    const targetId = parseInt(items[idx].dataset.id);
    const req = state.requests.find(r => r.id === targetId);
    if (req) {
      activeRequestId = req.id;
      document.querySelectorAll('.request-item.active, .call-chain-item.active').forEach(el => el.classList.remove('active'));
      items[idx].classList.add('active');
      // 滚动到可见区域
      items[idx].scrollIntoView({ block: 'nearest' });
      showDetail(req);
    }
  }
});

// 已选请求计数
function updateSelectedCount() {
  selectedCountEl.textContent = t('selectedCount', { count: selectedIds.size });
  // 更新全选框状态
  const totalVisible = document.querySelectorAll('.request-checkbox').length;
  const checkedVisible = document.querySelectorAll('.request-checkbox:checked').length;
  if (selectAll) {
    selectAll.checked = totalVisible > 0 && checkedVisible === totalVisible;
    selectAll.indeterminate = checkedVisible > 0 && checkedVisible < totalVisible;
  }
}

// 全选/取消全选
selectAll.addEventListener('change', () => {
  const checked = selectAll.checked;
  document.querySelectorAll('.request-checkbox').forEach(cb => {
    cb.checked = checked;
    const id = parseInt(cb.closest('.request-item')?.dataset?.id);
    if (id) {
      if (checked) selectedIds.add(id);
      else selectedIds.delete(id);
    }
  });
  updateSelectedCount();
});

// 导出选中
btnExportSelected.addEventListener('click', () => {
  if (selectedIds.size === 0) {
    showToast(t('noSelectedRequests'), true);
    return;
  }
  const selected = state.requests.filter(r => selectedIds.has(r.id));
  exportSelected(selected);
});

// 展开全部域名
btnExpandAll.addEventListener('click', () => {
  for (const r of state.requests) {
    expandedDomains.add(extractDomain(r.url));
  }
  renderRequests(state.requests);
});

// 折叠全部域名
btnCollapseAll.addEventListener('click', () => {
  expandedDomains.clear();
  domainRenderCount.clear();
  renderRequests(state.requests);
});

// 刷新当前页面
btnRefresh.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.reload(tabs[0].id, () => {
        showToast(t('pageRefreshed'));
      });
    }
  });
});

// ============================================================
// 代理配置
// ============================================================

// 切换代理配置栏显隐
btnProxy.addEventListener('click', () => {
  const isHidden = proxyBar.style.display === 'none';
  proxyBar.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    // 加载当前配置
    chrome.runtime.sendMessage({ type: 'GET_PROXY_TARGET' }, (response) => {
      if (response) {
        proxyTargetInput.value = response.target || '';
        proxyPathFrom.value = response.pathFrom || '';
        proxyPathTo.value = response.pathTo || '';
        proxyCustomCookie.value = response.customCookie || '';
      }
    });
    proxyTargetInput.focus();
  }
});

// 保存代理目标
btnSaveProxy.addEventListener('click', saveProxyTarget);

// 回车保存 (任意输入框)
proxyTargetInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProxyTarget();
});
proxyPathFrom.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProxyTarget();
});
proxyPathTo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProxyTarget();
});
proxyCustomCookie.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveProxyTarget();
});

function saveProxyTarget() {
  const target = proxyTargetInput.value.trim();
  if (!target) {
    showToast(t('proxyTargetRequired'), true);
    return;
  }
  chrome.runtime.sendMessage({
    type: 'SAVE_PROXY_TARGET',
    target,
    pathFrom: proxyPathFrom.value.trim(),
    pathTo: proxyPathTo.value.trim(),
    customCookie: proxyCustomCookie.value.trim()
  }, (response) => {
    if (response && response.success) {
      showToast(t('proxySaved'));
    } else {
      showToast(t('saveFailed'), true);
    }
  });
}

// 页脚点击: 慢请求 Top 5
document.querySelector('.footer').addEventListener('click', (e) => {
  if (e.target.closest('.footer-slow-count')) {
    showSlowTop5();
  }
});

// ============================================================
// Postman 同步
// ============================================================

// 切换 Postman 配置栏显隐
btnPostman.addEventListener('click', () => {
  const isHidden = postmanBar.style.display === 'none';
  postmanBar.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    // 直接通过 storage 读取 postman 配置
    chrome.storage.local.get(['postmanApiKey', 'postmanWorkspace'], (data) => {
      if (data.postmanApiKey) postmanApiKey.value = data.postmanApiKey;
      if (data.postmanWorkspace) postmanWorkspace.value = data.postmanWorkspace;
    });
    // 设置默认集合名称
    if (!postmanCollectionName.value) {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      postmanCollectionName.value = `HTTP Requests - ${dateStr}`;
    }
    postmanApiKey.focus();
  }
});

function getSyncRequestIds() {
  if (selectedIds.size > 0) return [...selectedIds];
  return state.requests.map(r => r.id);
}

// 同步到 Postman
btnSyncPostman.addEventListener('click', () => {
  const apiKey = postmanApiKey.value.trim();
  if (!apiKey) {
    showToast(t('postmanKeyRequired'), true);
    postmanApiKey.focus();
    return;
  }

  const collectionName = postmanCollectionName.value.trim() || undefined;
  const workspace = postmanWorkspace.value.trim() || undefined;

  if (state.requests.length === 0) {
    showToast(t('noSyncRequests'), true);
    return;
  }

  btnSyncPostman.disabled = true;
  btnSyncPostman.textContent = t('syncing');

  chrome.runtime.sendMessage({
    type: 'SYNC_POSTMAN',
    apiKey,
    workspace,
    collectionName,
    ids: getSyncRequestIds()
  }, (response) => {
    btnSyncPostman.disabled = false;
    btnSyncPostman.textContent = t('syncPostman');
    if (response && response.success) {
      showToast(t('syncedPostman', { name: response.name }));
      // 保存 API Key 和 Workspace
      chrome.storage.local.set({ postmanApiKey: apiKey, postmanWorkspace: workspace || '' });
      postmanBar.style.display = 'none';
    } else {
      showToast(t('syncFailed', { error: response?.error || t('unknownError') }), true);
    }
  });
});

// 回车同步
postmanApiKey.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSyncPostman.click();
});
postmanWorkspace.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSyncPostman.click();
});
postmanCollectionName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSyncPostman.click();
});

// ============================================================
// 新功能: 抽屉事件绑定、星标筛选、域名下拉、引导、导出弹窗
// ============================================================

// 抽屉标签切换
document.querySelectorAll('.drawer-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    if (currentDetailReq) {
      activateDrawerTab(tabName);
    }
  });
});

// 抽屉关闭
drawerClose.addEventListener('click', closeDetail);

// 抽屉复制URL
drawerCopyUrl.addEventListener('click', () => {
  if (!currentDetailReq) return;
  navigator.clipboard.writeText(currentDetailReq.url).then(() => {
    showToast(t('urlCopied'));
  }).catch(() => showToast(t('copyFailed'), true));
});

// 抽屉复制cURL（默认 Windows cmd/PowerShell 兼容格式）
drawerCopyCurl.addEventListener('click', () => {
  if (!currentDetailReq) return;
  const curlWin = generateCurlWindows(currentDetailReq);
  navigator.clipboard.writeText(curlWin).then(() => {
    showToast(t('curlWinCopied'));
  }).catch(() => showToast(t('copyFailed'), true));
});

// 右键点击 cURL 按钮复制 bash 多行格式
drawerCopyCurl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (!currentDetailReq) return;
  const curlBash = generateCurl(currentDetailReq, false);
  navigator.clipboard.writeText(curlBash).then(() => {
    showToast(t('bashCopied'));
  }).catch(() => showToast(t('copyFailed'), true));
});

// 抽屉发送到本地
drawerSendLocal.addEventListener('click', () => {
  if (!currentDetailReq) return;
  const req = currentDetailReq;
  chrome.runtime.sendMessage({ type: 'GET_PROXY_TARGET' }, (config) => {
    if (!config || !config.target) {
      showToast(t('proxyMissing'), true);
      proxyBar.style.display = 'flex';
      proxyTargetInput.focus();
      return;
    }
    chrome.runtime.sendMessage({ type: 'REPLAY_REQUEST', id: req.id }, (response) => {
      if (response && response.success) {
        lastReplayResponse = { ...response, _forRequestId: req.id };
        showToast(t('sentLocal', { status: response.status, statusText: response.statusText }));
        // 切换到响应标签页，显示转发结果
        activateDrawerTab('response');
        renderDrawerResponse(req);
      } else {
        showToast(t('replayFailed', { error: response?.error || t('unknownError') }), true);
      }
    });
  });
});

// 抽屉导出单个请求
drawerExportSingle.addEventListener('click', () => {
  if (!currentDetailReq) return;
  exportSelected([currentDetailReq]);
});

// 抽屉拖拽手柄（调整高度）
let drawerDrag = false;
let drawerStartY = 0;
let drawerStartHeight = 0;
drawerHandle.addEventListener('mousedown', (e) => {
  drawerDrag = true;
  drawerStartY = e.clientY;
  const drawer = document.getElementById('detailDrawer');
  drawerStartHeight = drawer.offsetHeight;
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', (e) => {
  if (!drawerDrag) return;
  const drawer = document.getElementById('detailDrawer');
  if (!drawer.classList.contains('open')) {
    drawer.classList.add('open');
    requestList.classList.add('drawer-open');
    drawerStartHeight = drawer.offsetHeight;
    drawerStartY = e.clientY;
  }
  // 根据鼠标位置计算新高度（从底部往上拉）
  const popupHeight = document.getElementById('app').offsetHeight;
  const newHeight = Math.max(100, Math.min(popupHeight - 60, drawerStartHeight + (drawerStartY - e.clientY)));
  drawer.style.height = newHeight + 'px';
  requestList.style.paddingBottom = newHeight + 'px';
});
document.addEventListener('mouseup', () => {
  if (drawerDrag) {
    drawerDrag = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// 星标筛选
btnFilterStarred.addEventListener('click', () => {
  filterStarredOnly = !filterStarredOnly;
  btnFilterStarred.classList.toggle('active', filterStarredOnly);
  starFilterText.textContent = filterStarredOnly ? t('marked') : t('starred');
  renderRequests(state.requests);
});

// 域名下拉
domainDropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isVisible = domainDropdownMenu.style.display !== 'none';
  domainDropdownMenu.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    populateDomainList();
  }
});

function populateDomainList() {
  const listEl = domainDropdownList;
  const domainCounts = new Map();
  for (const r of state.requests) {
    const d = extractDomain(r.url);
    domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
  }
  const sorted = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]);
  let html = '';
  for (const [domain, count] of sorted) {
    const active = selectedDomain === domain ? ' active' : '';
    html += `<div class="domain-dropdown-item${active}" data-domain="${escapeHtml(domain)}">${escapeHtml(domain)} <span class="domain-count">${count}</span></div>`;
  }
  listEl.innerHTML = html;
  listEl.querySelectorAll('.domain-dropdown-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const domain = el.dataset.domain;
      selectedDomain = selectedDomain === domain ? '' : domain;
      domainDropdownText.textContent = selectedDomain || t('allDomains');
      domainDropdownMenu.style.display = 'none';
      listEl.querySelectorAll('.domain-dropdown-item').forEach(item => item.classList.remove('active'));
      if (selectedDomain) {
        const match = listEl.querySelector(`[data-domain="${CSS.escape(domain)}"]`);
        if (match) match.classList.add('active');
      }
      renderRequests(state.requests);
    });
  });
}

// 点击其他区域关闭域名下拉
document.addEventListener('click', () => {
  domainDropdownMenu.style.display = 'none';
});

// 导出弹窗关闭（加 null 保护，防止 DOM 未就绪导致脚本崩溃）
if (exportModalClose) {
  exportModalClose.addEventListener('click', () => {
    exportModal.style.display = 'none';
  });
}
if (exportModal) {
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) exportModal.style.display = 'none';
  });
}

// 引导
if (onboardingStart) {
  onboardingStart.addEventListener('click', () => {
    onboardingOverlay.style.display = 'none';
    localStorage.setItem('onboardingDone', 'true');
  });
}
if (onboardingOverlay) {
  onboardingOverlay.addEventListener('click', (e) => {
    if (e.target === onboardingOverlay) {
      onboardingOverlay.style.display = 'none';
      localStorage.setItem('onboardingDone', 'true');
    }
  });
}
