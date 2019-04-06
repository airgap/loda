(k=>{
var d=document,l = d.addEventListener,c=console.log;
l('queued-page', e=>{c("[Loda] Queued page for display", e.detail.page)})
l('permacache-hit', e=>{c("[Loda] Loaded page from permacache.", e.detail.page)})
l('page-cached', e=>{c("[Loda] Cached page", e.detail.page)})
l('page-permacached', e=>{c("[Loda] Saved page to permacache.", e.detail.page)})
l('cache-trimmed', e=>{c("[Loda] Cache trimmed - removed oldest page from cache.", e.detail.page)})
l('page-loading', e=>{c("[Loda] Loading page with cache.", e.detail.cache)})
l('page-loaded', e=>{c("[Loda] Loaded page")})
l('page-excluded', e=>{c("[Loda] Excluded page", e.detail.page)})
l('page-prepped', e=>{c("[Loda] Prepped page")})
l('api-error', e=>{c("[Loda] API error", e.detail.error)})
d.dispatchEvent(new CustomEvent('logging-enabled'));
})()
