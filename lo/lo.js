//Global variables

if(location.href.match(/(^|\?|&)loda-disabled(=(true|1))?($|&)/)) {
  console.log("[Loda] Loda disabled by URL.");
} else if (typeof Loda == "undefined") {


  Loda = {};
    window.addEventListener("popstate", Loda.popPage);

  Loda.VERSION = 0.5;
  Loda.VERSION_STRING = "0.5";

  //A = tryingToBinder
  Loda.A;

  //Loaded first time, B = Loda.loaded
  Loda.B = false;

  //Cursor position log. Used for predicting cursor movement. Loda.lastPos.
  Loda.C = {x: 0, y: 0}

  //Used for debugging. Stores current frame. Increased each time the mouse moves.
  Loda.F = 0;

  //Current cursor position.
  Loda.G = {
    x: 0,
    y: 0
  };

  //Cache of downloaded pages.
  Loda.cache = {};

  //Pages that are currently being cached.
  Loda.caching = {};

  //Pages that already have the RML-generated list of pages to cache retreived.
  Loda.loadedFor = [];

  //Used for time-delay hover caching. Currently unused.
  Loda.cacheTimer;

  //Automatically set by retreiving value from the Loda script tag.
  //Required for RML, and requires Loda account.
  //Not required for any other features.
  Loda.TACHYON_ID;

  Loda.siteVersion;

  //Keeps track of what page was just navigated away from.
  Loda.LAST_PAGE;

  //Keeps track of hash changes to ignore popState
  Loda.ignoreNav;

  //Stores the page that will be shown after load if link is clicked.
  Loda.queuedPage;

  //Override this to pass API calls through a custom proxy to protect your
  //API key and to allow you to filter requests to prevent DoS and other abuse
  Loda.SERVER = "https://api.loda.rocks";
  Loda.USING_PROXY = false;

  //Helper functions. Soon to be replaced.
  Loda.grab = elem => {
    if (typeof elem === "string") {
      var o = [];
      elem.split("|").forEach(x => o.push(document.getElementById(x)));
      return o.length == 1 ? o[0] : o;
    }
    return elem;
  };
  Loda.bind = (node, trigger, func) => {
    Loda.enumerateOver(Loda.expandSpaces(node), n => {
      Loda.enumerateOver(Loda.expandSpaces(trigger), t => {
        Loda.enumerateOver(func, f => {
          var node = Loda.grab(n);
          if(node) {
            if(t) {
              if(f) {
                node
                .addEventListener(t, f);
              }
              else console.log('Trying to bind a nonexistent function to a node')
            }
            else console.log('Trying to bind a function to a node with an invalid trigger')
          }
          else console.log('Trying to bind a function to nonexistant node')
        });
      });
    });
  };
  Loda.load = func => {
    Loda.enumerateOver(func, x => {
      Loda.bind(window, "load", x);
    });
  };

  Loda.doad = func => {
    Loda.enumerateOver(func, x => {
      Loda.bind(window, "DOMContentLoaded", x);
    });
  };

  Loda.dfload = func => {
    Loda.enumerateOver(func, x => {
      Loda.bind(window, "load", ()=>{
        setTimeout(x,0);
      })
    });
  };

  Loda.enumerateOver = (array, func) => {
    if (Array.isArray(array)) for (var n of Array.from(array)) func(n);
    else func(array);
  };

  Loda.expandSpaces = array => {
    return typeof array == "string" ? array.split(" ") : array;
  };

  Loda.addc = (elem, clas) => {
    Loda.enumerateOver(Loda.grab(elem), x => {
      x.classList.add(clas);
    });
  };
  Loda.remc = (elem, clas) => {
    Loda.enumerateOver(Loda.grab(elem), x => {
      x.classList.remove(clas);
    });
  };
  Loda.setc = (elem, clas, val) => {
    Loda[val?'addc':'remc'](elem, clas);
  }
  Loda.hasc = (elem, clas) => {
    return Loda.grab(elem).classList.contains(clas);
  };

  Loda.togc = (elem, clas) => {
    Loda.enumerateOver(Loda.grab(elem), x => {
      if(Loda.hasc(x,clas))Loda.remc(x,clas);
      else Loda.addc(x,clas);
    });
  };

  Loda.isDebugging = () => {
    var sc = Loda.grab('loda-script');
    return sc && sc.getAttribute('loda-debugging') == "true";
  }

  //Runs on page load.
  Loda.loader = () => {
    if(typeof Loda.deferredPageLoadSpooler != 'undefined') {
      clearTimeout(Loda.deferredPageLoadSpooler);
    }
    //This will do something once a Debug flag attribute is added
    //console.log(Loda.cache);
    if (Loda.A) {
      clearTimeout(Loda.A);
    }
    Loda.A = setTimeout(Loda.actualLoader, 10);
  };
  Loda.actualLoader = () => {
    if (!document.body) {
      Loda.loader();
      return;
    }

    //Manually trigger load events
    if(Loda.B) {
      if(Loda.isDebugging())console.log("[Loda] Page loaded");
      [document, window].forEach(d=>{
        d.dispatchEvent(
          new UIEvent(
            "load"
          )
        );
        //console.log(d)
      })
    }
    var loda_blocked = false;
    if(typeof LODA_EXCLUSION_URLS != 'undefined') {
      if(Array.isArray(LODA_EXCLUSION_URLS)) {
        for(var u in LODA_EXCLUSION_URLS) {
          if(LODA_EXCLUSION_URLS[u] == location.href) {
            console.log("Loda excluded from this page.");
            loda_blocked = true;
            break;
          }
        }
      }
    }

    Loda.LAST_PAGE = location.href;
    if(!loda_blocked) {
      var links = document.getElementsByTagName("a");
      var a = document.createElement("a");
      var srcDomain = location.hostname;
      var srcHashPos = location.href.indexOf("#");
      if(srcHashPos == -1)srcHashPos = location.href.length;
      //alert(srcDomain)
      for (var i = 0; i < links.length; i++) {
        var lh = links[i].href;
        var destHashPos = lh.indexOf("#");
        if(destHashPos == -1)destHashPos = lh.length;
        if (links[i].href &&
          !links[i].getAttribute('loda-disabled') &&
          links[i].href.match(/^https?:\/\//) &&
          !links[i].getAttribute('target') &&
          ((location.href.match(/^(.+?):\/\//)||[0])[1] == (lh.match(/^(.+?):\/\//)||[0])[1]) &&
          links[i].href.match(new RegExp("^https?://"+srcDomain+"([:/#]|$)"))) {
          if(lh.substring(0,destHashPos) != location.href.substring(0,srcHashPos)) { //Different page
            links[i].addEventListener("mouseover", Loda.startHover);
            links[i].addEventListener("blur", Loda.endHover);
            links[i].addEventListener("mousedown", Loda.clickLink);
            a.href = links[i].getAttribute("href");
            links[i].setAttribute("loda-href", a.href);
            links[i].setAttribute("href", "javascript:void(0);");
          } else { //Just a hash change...probably
            links[i].addEventListener('click', Loda.ignoreNav);
          }
        }
      }
    }

    //Weebly compatibility

    /*var weeblyNavToggles = document.getElementsByClassName('w-navpane-trigger');
    for(var w = 0; w < weeblyNavToggles.length; w ++)
      var weeb = weeblyNavToggles[w];
      Loda.bind(weeb, 'click', ()=>{
        Loda.togc(weeb, 'w-navpane-trigger-active');
        Loda.togc(document.body, 'w-navpane-is-open');
      })*/

    document.body.addEventListener("mousemove", Loda.moved);
    var ts = Loda.grab("loda-script");
    var ti;
    if (ts) {
      ti = ts.getAttribute("loda-id");
      Loda.TACHYON_ID = ti;
      if(Loda.isDebugging())console.log("[Loda] Site version: " + Loda.getSiteVersion());

      var serv = ts.getAttribute('loda-proxy');
      Loda.SERVER = serv || "https://api.loda.rocks";
      Loda.USING_PROXY = serv;
    }
    if (typeof Loda.TACHYON_ID == "string" || Loda.USING_PROXY) {
      if (Loda.loadedFor.indexOf(location.href) < 0) {
        Loda.pollServer(location.href, null);
        Loda.loadedFor.push(location.href);
      }
    } else {
      if(Loda.isDebugging())console.log(
        "[Loda] No Loda ID present. This is A-OK unless you need RML."
      );
    }
    var pages = localStorage;
    var keys = Object.keys(pages);
    //console.log("AYY")
    if(Loda.isDebugging()) {
      for(var i = 0, len = localStorage.length; i < len; ++ i)console.log(localStorage.key(i))
    }
    if(Loda.isDebugging())console.log("[Loda] Page prepped");
    document.dispatchEvent(
      new CustomEvent(
        "page-prepped",
        {
          bubbles: true,
          cancelable: true,
        }
      )
    );
    Loda.B = true;
  };
  Loda.load(Loda.loader);

  //Retrieve RML data from server. Only called if Loda ID is provided.
  Loda.pollServer = (e, f) => {
    var x = new XMLHttpRequest();
    x.addEventListener("load", () => {
      var res = JSON.parse(x.response);
      var urls = res.pages;
      if (urls) {
        for (url of Array.from(urls)) {
          Loda.cachePage(url);
        }
      } else {
        if(Loda.isDebugging())console.log(res.err.description);
      }
    });
    var a = document.createElement("a");
    a.href = e;
    var data = {
      action: "loading_page",
      current_page: a.href,
      api_key: Loda.TACHYON_ID
    };
    if (f) {
      a.href = f;
      data.last_page = a.href;
    }
    x.open("POST", Loda.SERVER);
    x.send(JSON.stringify(data));

    function fetchUrl(url) {
      Loda.caching[url] = true;
      var x = new XMLHttpRequest();
      x.addEventListener("load", () => {
        Loda.cache[url] = x.response;
        //Trim cache here
      });
      x.open("GET", url);
      x.send();
    }
  };

  //Called when a user clicked on a Loda-enabled anchor.
  Loda.clickLink = e => {
    var d;
    if (typeof e == `string`) d = e;
    else {
      makeDeferredPageLoadSpooler();
      var d = e.target;
      while (d && !d.getAttribute("loda-href")) d = d.parentNode;
      d = d.getAttribute("loda-href");
    }
    var last_page = Loda.LAST_PAGE;
    Loda.loadPage(d);
    if (typeof Loda.TACHYON_ID == "string") Loda.pollServer(d, last_page);
  };

  //Retreives a page for preloading.
  Loda.loadPage = (e, pop) => {
    Loda.LAST_PAGE = e;
    if (Loda.cache[e])
      setTimeout(() => {
        Loda.showPage(e, pop);
      }, 0);
    else Loda.cachePage(e, true, pop);
  };

  function makeDeferredPageLoadSpooler() {
    if(!Loda.deferredPageLoadSpooler) {
      Loda.deferredPageLoadSpooler = setTimeout(()=>{
        var b = document.body;
        b.style.cursor = "none";
        b.style.pointerEvents = "none";
        b.style.opacity = .5;
      }, 500)
    }
  }

  //Called when the movement prediction detects a hover.
  //If the hovered element (or ancestor) has an href, preload it.
  Loda.startHover = e => {
    var d = e.target;
    while (
      d &&
      typeof d.getAttribute == "function" &&
      !d.getAttribute("loda-href")
    )
      d = d.parentNode;
    if (d && typeof d.getAttribute == "function") {
      d = d.getAttribute("loda-href");
      if (Loda.cacheTimer) {
        clearTimeout(Loda.cacheTimer);
      }
      Loda.cacheTimer = setTimeout(() => {
        Loda.cachePage(d);
      }, 0);
    }
  };
  Loda.endHover = e => {
    if (Loda.cacheTimer) {
      clearTimeout(Loda.cacheTimer);
    }
  };

  //Cache a page if it is not already cached or being cached.
  Loda.cachePage = (page, show, pop) => {
    if(show) {
        Loda.queuedPage = page;
        if(Loda.isDebugging()) console.log("[Loda] Queued page for display", page)
        document.dispatchEvent(
          new CustomEvent(
            "queued-page",
            {
              bubbles: true,
              cancelable: true,
              detail: {
                page: page
                /* Will eventually include the link that was clicked */
              }
            }
          )
        );
    }
    if (Loda.caching[page]) return;
    Loda.caching[page] = true;
    var sp = Loda.storedPageFor(page);
    if (
      Loda.getSiteVersion() > -1 &&
      sp &&
      sp.version >= Loda.getSiteVersion()
    ) {
      Loda.cache[page] = sp.content;
      document.dispatchEvent(
        new CustomEvent(
          "permacache-hit",
          {
            bubbles: true,
            cancelable: true
          }
        )
      );
      if(Loda.isDebugging())console.log("[Loda] Loaded page from permacache.    " + page);
      if (Loda.queuedPage) Loda.showPage(page, pop);
    } else {
      var x = new XMLHttpRequest();
      x.addEventListener("load", () => {
        Loda.cache[page] = x.response;
        if(Loda.isDebugging()) console.log("[Loda] Cached page", page)
        document.dispatchEvent(
          new CustomEvent(
            "page-cached",
            {
              bubbles: true,
              cancelable: true,
              detail: {
                page: page,
                content: x.content
              }
            }
          )
        );
        Loda.cleanCache(x.response.length);
        if (Loda.getSiteVersion() > -1 && (Loda.cacheSize() + x.response.length < 4000000)) {
          localStorage.setItem(
            page,
            JSON.stringify({
              content: x.response,
              version: Loda.getSiteVersion(),
              date:+new Date(),
              last_used: +new Date(),
              owner: "Loda"
            })
          );
          if(Loda.isDebugging())console.log("[Loda] Saved page to permacache.");
          document.dispatchEvent(
            new CustomEvent(
              "page-permacached", //The foreseen hover ain't coming through
              {
                bubbles: true,
                cancelable: true
              }
            )
          );
        }
        //console.log(Loda.queuedPage);
        if(Loda.isDebugging())console.log("[Loda] Saved page to permacache.");
        if (Loda.queuedPage) Loda.showPage(Loda.queuedPage, pop);
      });
      x.open("GET", page);
      x.send();
    }
  };

  //Display a cached page.
  Loda.showPage = (page, pop) => {
    var html;
    if (page) {
      html = Loda.cache[page];
      window.document.open();
      window.document.write(html);
      window.document.close();
      if (!pop)
        history.pushState(
          {
            page: page
          },
          null,
          page
        );
      setTimeout(() => {
        Loda.loader();
      }, 0);
    } else {
      //Loda.queuedPage = page;
      cachePage("index.html", true, true);
    }
  };

  var foreseen;

  Loda.moved = e => {
    var c = {
      x: e.clientX,
      y: e.clientY,
      f: Loda.F++
    };
    Loda.G = c;
    Loda.pollCursor();
  };

  //Get the cursor's current position and calculate its trajectory.
  Loda.pollCursor = () => {
    var c = Loda.G;

    //deltas
    var p = Loda.C || { x: 0, y: 0 };
    var p2 = Loda.G || { x: 0, y: 0 };
    var delta = {
      x: p2.x - p.x,
      y: p2.y - p.y
    };
    if (!delta) delta = { x: 0, y: 0 };

    //Maybe make X3
    var projectedDelta = { x: delta.x * 8, y: delta.y * 8 };
    //requestAnimationFrame(Loda.pollCursor);
    Loda.predictedCpos = Loda.sum(c, projectedDelta);
    Loda.hoverElement(Loda.predictedCpos);
      Loda.C = Loda.G;
  };

  //See if the cursor's projected trajectory includes an element to forsee a hover event for.
  Loda.hoverElement = pos => {
    var el = document.elementFromPoint(~~pos.x, ~~pos.y);
    if (foreseen && (!el || el != foreseen)) {
      Loda.remc(foreseen, "prehover");
      foreseen.dispatchEvent(
        new CustomEvent(
          "erphover", //The foreseen hover ain't coming through
          {
            bubbles: true,
            cancelable: true
          }
        )
      );
    }
    if (el && foreseen != el) {
      var oldAncestors = [];
      var node = foreseen;
      while (node) {
        node = node.parentNode;
        oldAncestors.push(node);
      }
      var newAncestors = [];
      var node = el;
      while (node) {
        node = node.parentNode;
        newAncestors.push(node);
      }
      for (var node of Array.from(oldAncestors))
        if (node && node.classList && newAncestors.indexOf(node) < 0)
          Loda.remc(node, "prehover");
      for (var node of Array.from(newAncestors))
        if (node && node.classList && oldAncestors.indexOf(node) < 0)
          Loda.addc(node, "prehover");

      Loda.addc(el, "prehover");
      el.dispatchEvent(
        new CustomEvent("prehover", {
          bubbles: true,
          cancelable: true
        })
      );
      foreseen = el;
    }
    if (el)
      Loda.startHover({
        target: el
      });
  };

  //reload the page to clear the cache if the user clicks back or next
  Loda.popPage = o => {
    //location.reload();
    //alert(JSON.stringify(o.state))
    if(event.state === null/*Loda.changingHash*/ && Loda.changingHash) {
      Loda.changingHash = false;
      //alert();
    } else {
      location.reload();
    }

  };

  Loda.ignoreNav = o => {
    Loda.changingHash = true;
  }

  //Sum two coordinates.
  Loda.sum = (posa, posb) => {
    return {
      x: posa.x + posb.x,
      y: posa.y + posb.y
    };
  };

Loda.getSiteVersion = () => {
  var ts = Loda.grab("loda-script");

  return ts ? ts.getAttribute("site-version") || -1 : -1;
};

Loda.storedPageFor = page => {
  var data = localStorage.getItem(page);
  try {
    data = JSON.parse(data);
  } catch (ex) {}
  return data || 0;
};

Loda.pollCursor();

Loda.cacheSize = () => {
  var cacheSize = 0;
  for(var i = 0, len = localStorage.length; i < len; ++ i) {
    var k = localStorage.key(i);
    var v = localStorage.getItem(k);
    var data;
    try {
      data = JSON.parse(v);
    } catch (ex) {
      continue;
    }
    if(data.owner == "Loda") {
      cacheSize += data.content.length;
    }
  }
  return cacheSize;
}

Loda.cleanCache = (extra) => {
  var cacheSize = Loda.cacheSize();
  while(cacheSize + extra > 4000000 && cacheSize > 0) {
    var cacheSize = 0;
    var earliestDate = +new Date();
    var earliestId;
    for(var i = 0, len = localStorage.length; i < len; ++ i) {
      var k = localStorage.key(i);
      var v = localStorage.getItem(k);
      var data;
      try {
        data = JSON.parse(v);
      } catch (ex) {
        continue;
      }
      if(data.owner == "Loda") {
        cacheSize += data.content.length;
        if(data.last_used < earliestDate) {
          earliestDate = data.last_used;
          earliestId = k;
        }
      }
    }
    if(earliestId) {
      localStorage.removeItem(earliestId);
      if(Loda.isDebugging())console.log("[Loda] Removed oldest page from cache.", earliestId)
    }

  }

  document.dispatchEvent(
    new CustomEvent(
      "cache-cleaned", //The foreseen hover ain't coming through
      {
        bubbles: true,
        cancelable: true
      }
    )
  );

}

Loda.fload = (url, body, expectJson, params) => {
  var state = 0, data = {}, json, succCb, failCb, response, fetchComplete, domLoaded;
  if(typeof body == 'object') {
    body = JSON.stringify(body);
    json = true;
  }
  if(params) data = params;
  if(typeof body == 'string') {
    data.method = 'POST';
    data.body = body;
  }

  this.then=function(cb){
    succCb = cb;
    return this;
  }

  this.fail=function(cb){
    failCb = cb;
    return this;
  }
  fetch(url, data)
  .then(res=>{
    if(res.ok)
      (expectJson?res.json():res.text())
      .then(res => {
        fetchComplete = true;
        trySuccess(res)
      }).catch(res=>{
        if(failCb)failCb(res);
        else throw new Error(res)
      })
    else if(fail) fail('Error fetching request.')
    else throw new Error('Error fetching request.');
  }).catch(res=>{
    if(failCb)failCb(res);
    else throw new Error(res)
  })
  function trySuccess(res) {
    if(res)response = res;
    state++;
    if(response && (domLoaded||Loda.domLoaded)) {
      if(succCb)succCb(response);
    }
  }
  Loda.bind(window, 'DOMContentLoaded',e=>{
    domLoaded = true;
    trySuccess()
  })
  return this;
}
Loda.bind(window, 'DOMContentLoaded', e => {
  Loda.domLoaded = true;
})

}
