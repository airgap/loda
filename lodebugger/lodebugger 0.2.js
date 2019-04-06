(k=>{
var d=document,l = d.addEventListener,c=console.log, p = "page", fns = [
  ['queued-page', "[Loda] Queued page for display", p],
['permacache-hit', "[Loda] Loaded page from permacache.", p],
['page-cached', "[Loda] Cached page", p],
['page-permacached', "[Loda] Saved page to permacache.", p],
['cache-trimmed', "[Loda] Cache trimmed - removed oldest page from cache.", p],
['page-loading', "[Loda] Loading page with cache.", "cache"],
['page-loaded', "[Loda] Loaded page"],
['page-excluded', "[Loda] Excluded page", p],
['page-prepped', "[Loda] Prepped page"],
['api-error', "[Loda] API error", "error"]
];
for(var f=0;f<fns.length;f++)d.addEventListener(fns[f][0],e=>{console.log(fns[f][1],fns[f][2])});
d.dispatchEvent(new CustomEvent('logging-enabled'));
})()
