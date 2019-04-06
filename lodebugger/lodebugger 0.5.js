(function(){var d=document, p = "page",q=p+"-",s=[
['queued-page',"[Loda] Queued page for display",p],
['permacache-hit',"[Loda] Loaded page from permacache.",p],
[q+'cached',"[Loda] Cached "+p,p],
[q+'permacached',"[Loda] Saved page to permacache.",p],
['cache-trimmed',"[Loda] Cache trimmed - removed oldest page from cache.",p],
[q+'loading',"[Loda] Loading page with cache.","cache"],
[q+'loaded',"[Loda] Loaded "+p],
[q+'excluded',"[Loda] Excluded "+p,p],
[q+'prepped',"[Loda] Prepped "+p],
['api-error',"[Loda] API error", "error"],
['logging-enabled',"[Loda] Logging enabled."]
];
for(q in s){p=s[q];d.addEventListener(p[0],function(e){console.log(p[1],p[2]?e.detail[p[2]]:null)});}
d.dispatchEvent(new CustomEvent('logging-enabled'));
})()
/*
page-page-page-page-page-page-page-
q='page-'q+q+q+q+q+q+q+
q=p+'-'q+q+q+q+q+q+q+
p+-p+-p+-p+-p+-p+-p+-
*/
