(function(){
var d=document, p = "page",f,g,s=[
  ['queued-page', "[Loda] Queued page for display", p],
['permacache-hit', "[Loda] Loaded page from permacache.", p],
['page-cached', "[Loda] Cached page", p],
['page-permacached', "[Loda] Saved page to permacache.", p],
['cache-trimmed', "[Loda] Cache trimmed - removed oldest page from cache.", p],
['page-loading', "[Loda] Loading page with cache.", "cache"],
['page-loaded', "[Loda] Loaded page"],
['page-excluded', "[Loda] Excluded page", p],
['page-prepped', "[Loda] Prepped page"],
['api-error', "[Loda] API error", "error"],
['logging-enabled', "[Loda] Logging enabled."]
];
for(f in s){g=s[f];d.addEventListener(g[0],function(e){console.log(g[1],g[2]?e.detail[g[2]]:null)});}
d.dispatchEvent(new CustomEvent('logging-enabled'));
})()
