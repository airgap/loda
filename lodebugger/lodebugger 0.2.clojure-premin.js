(function(b){b=document;for(var c=[["queued-page","[Loda] Queued page for display","page"],["permacache-hit","[Loda] Loaded page from permacache.","page"],["page-cached","[Loda] Cached page","page"],["page-permacached","[Loda] Saved page to permacache.","page"],["cache-trimmed","[Loda] Cache trimmed - removed oldest page from cache.","page"],["page-loading","[Loda] Loading page with cache.","cache"],["page-loaded","[Loda] Loaded page"],["page-excluded","[Loda] Excluded page","page"],["page-prepped",
"[Loda] Prepped page"],["api-error","[Loda] API error","error"]],a=0;a<c.length;a++)b.addEventListener(c[a][0],function(b){console.log(c[a][1],c[a][2])});b.dispatchEvent(new CustomEvent("logging-enabled"))})();