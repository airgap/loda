// FTL.js from ftl.rocks
(k=>{var f,j=P={x:0,y:0},M=e=>{var c={x:e.clientX,y:e.clientY};j=c;u()},G=Math,H=G.pow,l=v=>{return G.min(200,G.max(-200,v))},O=document,V=(a,b,c)=>{a.dispatchEvent(new CustomEvent(b,c))},F='parentNode',u=k=>{var q=j,D={x:l((q.x-P.x)*8),y:l((q.y-P.y)*8)},C={x:q.x+D.x,y:q.y+D.y,d:H(H(D.x,2)+H(D.y,2),.5)};V(O,"precursormove",{detail:{x:C.x,y:C.y,d:C.d}});E(C);P=j},E=s=>{var l=O.elementFromPoint(s.x,s.y),B=A=[],n=f,r='classList',v='prehover';if(f&&(!l||l!=f)){f[r].remove(v);V(f,"erphover")}if(l&&f!=l){while(n)B.push(n=n[F]);n=l;while(n)A.push(n=n[F]);for(n of B){if(n&&A.indexOf(n)<0){n[r].remove(v)}}for(n of A){if(n&&B.indexOf(n)<0){n[r].add(v)}}l[r].add(v);V(l,v,{detail:{d:s.d}});f=l}};O.addEventListener("mousemove",M)})()


//Global variables

if(location.href.match(/(^|\?|&)loda-disabled(=(true|1))?($|&)/)) {
  console.log("[Loda] Loda disabled by URL.");
} else if (typeof Loda == "undefined") {


  L = {};
    window.addEventListener("popstate", L.popPage);

  L.VERSION = 0.50;
  L.VERSION_STRING = "0.5";

  L.tryingToBinder;

  //Loaded first time
  L.loaded = false;

  //Cursor position log. Used for predicting cursor movement.
  L.positions = [];
  L.lastPos = {x: 0, y: 0}

  //Used for extra-console logging. Automatically set with the log(string) function
  L.logbox;

  //Used for debugging. Stores current frame. Increased each time the mouse moves.
  L.frame = 0;

  //Current cursor position.
  L.cpos = {
    x: 0,
    y: 0
  };

  //Cache of downloaded pages.
  L.cache = {};

  //Pages that are currently being cached.
  L.caching = {};

  //Pages that already have the RML-generated list of pages to cache retreived.
  L.loadedFor = [];

  //Used for time-delay hover caching. Currently unused.
  L.cacheTimer;

  //Automatically set by retreiving value from the Loda script tag.
  //Required for RML, and requires Loda account.
  //Not required for any other features.
  L.LODA_ID;

  L.siteVersion;

  //Keeps track of what page was just navigated away from.
  L.LAST_PAGE;

  //Keeps track of hash changes to ignore popState
  L.ignoreNav;

  //Stores the page that will be shown after load if link is clicked.
  L.queuedPage;

  //Override this to pass API calls through a custom proxy to protect your
  //API key and to allow you to filter requests to prevent DoS and other abuse
  L.SERVER = "https://api.loda.rocks";
  L.USING_PROXY = false;

  //Helper functions. Soon to be replaced.
  L.grab = elem => {
    if (typeof elem === "string") {
      var o = [];
      elem.split("|").forEach(x => o.push(document.getElementById(x)));
      return o.length == 1 ? o[0] : o;
    }
    return elem;
  };
  L.bind = (node, trigger, func) => {
    L.enumerateOver(L.expandSpaces(node), n => {
      L.enumerateOver(L.expandSpaces(trigger), t => {
        L.enumerateOver(func, f => {
          var node = L.grab(n);
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
  L.load = func => {
    L.enumerateOver(func, x => {
      L.bind(window, "load", x);
    });
  };

  L.doad = func => {
    L.enumerateOver(func, x => {
      L.bind(window, "DOMContentLoaded", x);
    });
  };

  L.dfload = func => {
    L.enumerateOver(func, x => {
      L.bind(window, "load", ()=>{
        setTimeout(x,0);
      })
    });
  };

  L.enumerateOver = (array, func) => {
    if (Array.isArray(array)) for (var n of Array.from(array)) func(n);
    else func(array);
  };

  L.expandSpaces = array => {
    return typeof array == "string" ? array.split(" ") : array;
  };

  L.addc = (elem, clas) => {
    L.enumerateOver(L.grab(elem), x => {
      x.classList.add(clas);
    });
  };
  L.remc = (elem, clas) => {
    L.enumerateOver(L.grab(elem), x => {
      x.classList.remove(clas);
    });
  };
  L.setc = (elem, clas, val) => {
    Loda[val?'addc':'remc'](elem, clas);
  }
  L.hasc = (elem, clas) => {
    return L.grab(elem).classList.contains(clas);
  };

  L.togc = (elem, clas) => {
    L.enumerateOver(L.grab(elem), x => {
      if(L.hasc(x,clas))L.remc(x,clas);
      else L.addc(x,clas);
    });
  };

  //Runs on page load.
  L.loader = () => {
    if(typeof L.deferredPageLoadSpooler != 'undefined') {
      clearTimeout(L.deferredPageLoadSpooler);
    }
    document.dispatchEvent(new CustomEvent(
      'page-loading', {
        detail: {
          cache: L.cache
        }
      }
    ));
    if (L.TryingToBinder) {
      clearTimeout(L.tryingToBinder);
    }
    L.tryingToBinder = setTimeout(L.actualLoader, 10);
  };
  L.actualLoader = () => {
    if (!document.body) {
      L.loader();
      return;
    }

    //Manually trigger load events
    if(L.loaded) {
      document.dispatchEvent(new CustomEvent('page-loaded'));
      [document, window].forEach(d=>{
        d.dispatchEvent(
          new UIEvent(
            "load"
          )
        );
      })
    }
    var loda_blocked = false;
    if(typeof LODA_EXCLUSION_URLS != 'undefined') {
      if(Array.isArray(LODA_EXCLUSION_URLS)) {
        for(var u in LODA_EXCLUSION_URLS) {
          if(LODA_EXCLUSION_URLS[u] == location.href) {
            document.dispatchEvent(new CustomEvent('page-excluded', {detail:{page:location.href}}))
            loda_blocked = true;
            break;
          }
        }
      }
    }

    L.LAST_PAGE = location.href;
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
            //links[i].addEventListener("mouseover", L.startHover);
            //links[i].addEventListener("blur", L.endHover);
            links[i].addEventListener('prehover', e=>{
              L.startHover({
                target: links[i]
              });
            });
            links[i].addEventListener("mousedown", L.clickLink);
            a.href = links[i].getAttribute("href");
            links[i].setAttribute("loda-href", a.href);
            links[i].setAttribute("href", "javascript:void(0);");
          } else { //Just a hash change...probably
            links[i].addEventListener('click', L.ignoreNav);
          }
        }
      }
    }

    var ts = L.grab("loda-script");
    var ti;
    if (ts) {
      ti = ts.getAttribute("loda-id");
      L.LODA_ID = ti;

      var serv = ts.getAttribute('loda-proxy');
      L.SERVER = serv || "https://api.loda.rocks";
      L.USING_PROXY = serv;
    }
    if (typeof L.LODA_ID == "string" || L.USING_PROXY) {
      if (L.loadedFor.indexOf(location.href) < 0) {
        L.pollServer(location.href, null);
        L.loadedFor.push(location.href);
      }
    }
    document.dispatchEvent(
      new CustomEvent(
        "page-prepped",
        {
          bubbles: true,
          cancelable: true,
        }
      )
    );
    L.loaded = true;
  };
  L.load(L.loader);

  //Retrieve RML data from server. Only called if Loda ID is provided.
  L.pollServer = (e, f) => {
    var x = new XMLHttpRequest();
    x.addEventListener("load", () => {
      var res = JSON.parse(x.response);
      var urls = res.pages;
      if (urls) {
        for (url of Array.from(urls)) {
          L.cachePage(url);
        }
      } else {
        document.dispatchEvent('api-error', { detail: { error: res.err } })
      }
    });
    var a = document.createElement("a");
    a.href = e;
    var data = {
      action: "loading_page",
      current_page: a.href,
      api_key: L.LODA_ID
    };
    if (f) {
      a.href = f;
      data.last_page = a.href;
    }
    x.open("POST", L.SERVER);
    x.send(JSON.stringify(data));

    function fetchUrl(url) {
      L.caching[url] = true;
      var x = new XMLHttpRequest();
      x.addEventListener("load", () => {
        L.cache[url] = x.response;
        //Trim cache here
      });
      x.open("GET", url);
      x.send();
    }
  };

  //Called when a user clicked on a Loda-enabled anchor.
  L.clickLink = e => {
    var d;
    if (typeof e == `string`) d = e;
    else {
    var d = e.target;
      if(e.button) {
        if(e.button==2)
          d.href = d.getAttribute('loda-href');
        return;
      }
      makeDeferredPageLoadSpooler();
      while (d && !d.getAttribute("loda-href")) d = d.parentNode;
      d = d.getAttribute("loda-href");
    }
    var last_page = L.LAST_PAGE;
    L.loadPage(d);
    if (typeof L.LODA_ID == "string") L.pollServer(d, last_page);
  };

  //Retreives a page for preloading.
  L.loadPage = (e, pop) => {
    L.LAST_PAGE = e;
    if (L.cache[e])
      setTimeout(() => {
        L.showPage(e, pop);
      }, 0);
    else L.cachePage(e, true, pop);
  };

  function makeDeferredPageLoadSpooler() {
    if(!L.deferredPageLoadSpooler) {
      L.deferredPageLoadSpooler = setTimeout(()=>{
        var b = document.body;
        b.style.cursor = "none";
        b.style.pointerEvents = "none";
        b.style.opacity = .5;
      }, 500)
    }
  }

  //Called when the movement prediction detects a hover.
  //If the hovered element (or ancestor) has an href, preload it.
  L.startHover = e => {
    var d = e.target;
    while (
      d &&
      typeof d.getAttribute == "function" &&
      !d.getAttribute("loda-href")
    )
      d = d.parentNode;
    if (d && typeof d.getAttribute == "function") {
      d = d.getAttribute("loda-href");
      if (L.cacheTimer) {
        clearTimeout(L.cacheTimer);
      }
      L.cacheTimer = setTimeout(() => {
        L.cachePage(d);
      }, 0);
    }
  };
  L.endHover = e => {
    if (L.cacheTimer) {
      clearTimeout(L.cacheTimer);
    }
  };

  //Cache a page if it is not already cached or being cached.
  L.cachePage = (page, show, pop) => {
    if(show) {
        L.queuedPage = page;
        document.dispatchEvent(
          new CustomEvent(
            "page-queued",
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
    if (L.caching[page]) return;
    L.caching[page] = true;
    var sp = L.storedPageFor(page);
    if (
      L.getSiteVersion() > -1 &&
      sp &&
      sp.version >= L.getSiteVersion()
    ) {
      L.cache[page] = sp.content;
      document.dispatchEvent(
        new CustomEvent(
          "permacache-hit",
          {
            bubbles: true,
            cancelable: true,
            detail: {
              page: page
            }
          }
        )
      );
      if (L.queuedPage) L.showPage(page, pop);
    } else {
      var x = new XMLHttpRequest();
      x.addEventListener("load", () => {
        L.cache[page] = x.response;
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
        L.cleanCache(x.response.length);
        if (L.getSiteVersion() > -1 && (L.cacheSize() + x.response.length < 4000000)) {
          localStorage.setItem(
            page,
            JSON.stringify({
              content: x.response,
              version: L.getSiteVersion(),
              date:+new Date(),
              last_used: +new Date(),
              owner: "Loda"
            })
          );
          document.dispatchEvent(
            new CustomEvent(
              "page-permacached",
              {
                bubbles: true,
                cancelable: true
              }
            )
          );
        }
        if (L.queuedPage) L.showPage(L.queuedPage, pop);
      });
      x.open("GET", page);
      x.send();
    }
  };

  //Display a cached page.
  L.showPage = (page, pop) => {
    var html;
    if (page) {
      html = L.cache[page];
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
        L.loader();
      }, 0);
    } else {
      //L.queuedPage = page;
      cachePage("index.html", true, true);
    }
  };

  var foreseen;

  //reload the page to clear the cache if the user clicks back or next
  L.popPage = o => {
    //location.reload();
    //alert(JSON.stringify(o.state))
    if(event.state === null/*L.changingHash*/ && L.changingHash) {
      L.changingHash = false;
      //alert();
    } else {
      location.reload();
    }

  };

  L.ignoreNav = o => {
    L.changingHash = true;
  }

  //Sum two coordinates.
  L.sum = (posa, posb) => {
    return {
      x: posa.x + posb.x,
      y: posa.y + posb.y
    };
  };

  //Log something to the #log box if one exists.
  L.log = text => {
    if (!L.logbox) L.logbox = L.grab("log");
    if (L.logbox)
      L.logbox.innerHTML =
        typeof text === "object" ? JSON.stringify(text) : text;
  };

L.getSiteVersion = () => {
  var ts = L.grab("loda-script");

  return ts ? ts.getAttribute("site-version") || -1 : -1;
};

L.storedPageFor = page => {
  var data = localStorage.getItem(page);
  try {
    data = JSON.parse(data);
  } catch (ex) {}
  return data || 0;
};

//L.pollCursor();

L.cacheSize = () => {
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

L.cleanCache = (extra) => {
  var cacheSize = L.cacheSize();
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
      document.dispatchEvent(
        new CustomEvent(
          "cache-trimmed",
          {
            bubbles: true,
            cancelable: true,
            detail: {
              page: earliestId
            }
          }
        )
      )
    }

  }

  document.dispatchEvent(
    new CustomEvent(
      "cache-cleaned",
      {
        bubbles: true,
        cancelable: true
      }
    )
  );

}

L.fload = (url, body, expectJson, params) => {
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
    if(response && (domLoaded||L.domLoaded)) {
      if(succCb)succCb(response);
    }
  }
  L.bind(window, 'DOMContentLoaded',e=>{
    domLoaded = true;
    trySuccess()
  })
  return this;
}
L.bind(window, 'DOMContentLoaded', e => {
  L.domLoaded = true;
})

Loda = L;

}
