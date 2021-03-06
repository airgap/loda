(function() {
  var d = document,
  p = "page",
  l = "[Loda] ",
  q = p + "-",
  s = [
    [q + "queued", l + "Queued page for display", p],
    ["permacache-hit", l + "Loaded page from permacache.", p],
    [q + "cached", l + "Cached " + p, p],
    [q + "permacached", l + "Saved page to permacache.", p],
    ["cache-trimmed", l + "Cache trimmed - removed oldest page from cache.", p],
    [q + "loading", l + "Loading page with cache.", "cache"],
    [q + "loaded", l + "Loaded " + p],
    [q + "excluded", l + "Excluded " + p, p],
    [q + "prepped", l + "Prepped " + p],
    ["api-error", l + "API error", "error"],
    ["logging-enabled", l + "Logging enabled."]
  ];
  for (q in s) {
    j(s[q]);
  }
  function j(p) {
    d.addEventListener(p[0], function(e) {
      console.log(p[1], p[2] ? e.detail[p[2]] : null);
    });
  }
  d.dispatchEvent(new CustomEvent("logging-enabled"));
})();
