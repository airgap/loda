/**
 * This section is FTL.js from ftl.rocks, another Airgap project.
 * GitHub: https://github.com/airgap/ftl
 * Minifies to 722 bytes
 */
(k => {
    var f, j = P = {
            'x': 0,
            'y': 0
        },
        M = e => {
            var c = {
                'x': e.clientX,
                'y': e.clientY
            };
            j = c;
            u()
        },
        G = Math,
        H = G.pow,
        l = v => {
            return G.min(200, G.max(-200, v))
        },
        O = document,
        V = (a, b, c) => {
            a.dispatchEvent(new CustomEvent(b, {
                'detail': c
            }))
        },
        F = 'parentNode',
        u = k => {
            var q = j,
                D = {
                    'x': l((q.x - P.x) * 8),
                    'y': l((q.y - P.y) * 8)
                },
                C = {
                    'x': q.x + D.x,
                    'y': q.y + D.y,
                    'd': H(H(D.x, 2) + H(D.y, 2), .5)
                };
            V(O, "precursormove", {
                'x': C.x,
                'y': C.y,
                'd': C.d
            });
            E(C);
            P = j
        },
        E = s => {
            var l = O.elementFromPoint(s.x, s.y),
                B = A = [],
                n = f,
                r = 'classList',
                v = 'prehover';
            if (f && (!l || l != f)) {
                f[r].remove(v);
                V(f, "erphover")
            }
            if (l && f != l) {
                while (n) B.push(n = n[F]);
                n = l;
                while (n) A.push(n = n[F]);
                for (n of B) {
                    if (n && A.indexOf(n) < 0) {
                        n[r].remove(v)
                    }
                }
                for (n of A) {
                    if (n && B.indexOf(n) < 0) {
                        n[r].add(v)
                    }
                }
                l[r].add(v);
                V(l, v, {
                    'd': s.d
                });
                f = l
            }
        };
    O.addEventListener("mousemove", M)
})()

// End of FTL.js
// Now for the actual Loda script:

//Check to see if Loda is disabled by ?loda-disabled=true in the URL
if (location.href.match(/(^|\?|&)loda-disabled(=(true|1))?($|&)/)) {
    console.log("[Loda] Loda disabled by URL.");
} else if (typeof Loda == "undefined") {

	/**
	 * Dispatch a custom event on the document object
	 * @param {text} a - event type
	 * @param {object} b - event detail
	 */

    var V = (a, b) => {
        document.dispatchEvent(new CustomEvent(a, {
            'detail': b
        }))
    },

		/**
		 * @namespace Loda
		 * @description This will be the global Loda object
		 */
    L = {};

		//Listen for back and forward button clicks
    window.addEventListener("popstate", L.popPage);

		//Is true if the load binder is trying to run
    L.tryingToBinder;

    //Loaded first time
    L.loaded = false;

    //Cursor position log. Used for predicting cursor movement.
    L.positions = [];
    L.lastPos = {
        'x': 0,
        'y': 0
    }

    //Used for extra-console logging. Automatically set with the log(string) function.
		//Deprecated but still usable by scripts relying on it. Will be phased out.
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

		/**
		 * @function grab
		 * @memberof Loda
		 * @description Get an element or elements by their IDs.
		 * @param {node} elem - string containing id or pipe-separated id list
		 * @returns node or array of nodes
		 */
    L.grab = elem => {
        if (typeof elem === "string") {
            var o = [];
            elem.split("|").forEach(x => o.push(document.getElementById(x)));
            return o.length == 1 ? o[0] : o;
        }
        return elem;
    };

		/**
		 * @function bind
		 * @memberof Loda
		 * @description Bind a function to an event.
		 * @param {node} node - the node to bind to
		 * @param {string} trigger - the event to listen to
		 * @param {function} func - the function to trigger
		 */
    L['bind'] = (node, trigger, func) => {
        node.addEventListener(trigger, func)
    };

		/**
		 * @function load
		 * @memberof Loda
		 * @description Run a function on window load.
		 * @param {function} func - function to run
		 */
    L['load'] = func => {
        L['bind'](window, "load", func);
    };

		/**
		 * @function doad
		 * @memberof Loda
		 * @description Run a function on DOM load.
		 * @param {function} func - function to run
		 */
    L['doad'] = func => {
        L['bind'](window, "DOMContentLoaded", func);
    };

		/**
		 * @function dfload
		 * @memberof Loda
		 * @description Run a function on DOM load, slightly deferred.
		 * @param {function} func - function to run
		 */
    L['dfload'] = func => {
        L['bind'](window, "load", () => {
            setTimeout(func, 0);
        })
    };

		/**
		 * @function enumerateOver
		 * @memberof Loda
		 * @description Run a function on a single object or array of objects.
		 * @param {object|array} array - single object or array to supply the function with
		 * @param {function} func - function to run over over object or array
		 */
    L.enumerateOver = (array, func) => {
        if (Array.isArray(array))
            for (var n of array) func(n);
        else func(array);
    };

    /**
		 * @function loader
		 * @memberof Loda
		 * @description Runs on page load. Prepares for Loda initialization.
		 */
    L.loader = () => {
			// Prevent any spooling animations from displaying
        if (typeof L.deferredPageLoadSpooler != 'undefined') {
            clearTimeout(L.deferredPageLoadSpooler);
        }

				// Dispatch the page-loading event
        V(
            'page-loading', {
                cache: L.cache
            }
        );

				// Clear and renew the Loda initialization delay
        if (L.TryingToBinder) {
            clearTimeout(L.tryingToBinder);
        }
        L.tryingToBinder = setTimeout(L.actualLoader, 10);
    };

    /**
		 * @function actualLoader
		 * @memberof Loda
		 * @description Initialize Loda.
		 */
    L.actualLoader = () => {
				// If no body exists, retry initialization
        if (!document.body) {
            L.loader();
            return;
        }

        // Manually trigger load events
        if (L.loaded) {
            V('page-loaded');
            [document, window].forEach(d => {
                d.dispatchEvent(
                    new UIEvent(
                        "load"
                    )
                );
            })
        }

				// See if this page is blacklisted
        var loda_blocked = false;
        if (typeof LODA_EXCLUSION_URLS != 'undefined') {
            if (Array.isArray(LODA_EXCLUSION_URLS)) {
                for (var u in LODA_EXCLUSION_URLS) {
                    if (LODA_EXCLUSION_URLS[u] == location.href) {
                        V('page-excluded', {
                            'page': location.href
                        })
                        loda_blocked = true;
                        break;
                    }
                }
            }
        }

				// Remember this page for when the user navigates away
        L.LAST_PAGE = location.href;

				// Don't do this stuff if Loda is blocked
        if (!loda_blocked) {

					// Find all the anchors on the page
            var links = document.getElementsByTagName("a");

						// I can't remember what this does but I'm too scared to change it
						// Something about making sure a URL was correctly formatted
            var a = document.createElement("a");

						// Get the current domain
            var srcDomain = location.hostname;

						// Get the hash position in the current URL
            var srcHashPos = location.href.indexOf("#");

						// If there is no hash, pretend there's one at the end
            if (srcHashPos == -1) srcHashPos = location.href.length;

						// Iterate over all links on the current page
            for (var i = 0; i < links.length; i++) {

							// Get the current link's href
                var lh = links[i].href;

								// Get its hash's location in the URL
                var destHashPos = lh.indexOf("#");

								// If no hash exists, pretend there's one at the end
                if (destHashPos == -1) destHashPos = lh.length;

								// If the link is actually a link and...
								//   doesn't have loda-disabled and...
								//   starts with a valid protocol and...
								//   doesn't have a target set and...
								//   I'm not sure what this next bit does and...
								//   the target domain is the current domain
                if (links[i].href &&
                    !links[i].getAttribute('loda-disabled') &&
                    links[i].href.match(/^https?:\/\//) &&
                    !links[i].getAttribute('target') &&
                    ((location.href.match(/^(.+?):\/\//) || [0])[1] == (lh.match(/^(.+?):\/\//) || [0])[1]) &&
                    links[i].href.match(new RegExp("^https?://" + srcDomain + "([:/#]|$)"))) {

										// Ensure the target page is not the active page,
										//   i.e. links to the same page will just trigger reload per usual
                    if (lh.substring(0, destHashPos) != location.href.substring(0, srcHashPos)) { //Different page

												// Trigger Loda's caching function on the link if FTL foresees a hover
                        links[i].addEventListener('prehover', e => {
                            L.startHover({
                                target: links[i]
                            });
                        });

												// Load the page from cache when the link is clicked down upon
                        links[i].addEventListener("mousedown", L.clickLink);

												// Still don't know for sure what this does
                        a.href = links[i].getAttribute("href");

												// Mark this link as accellerated by Loda
                        links[i].setAttribute("loda-href", "true");

                    } else { //Just a hash change...probably
                        links[i].addEventListener('click', L.ignoreNav);
                    }
                }
            }
        }

				// Find an element, probably the <script> reffing Loda, tagged as the Loda config
        var ts = L.grab("loda-script");

				// Variable to store the site's Loda ID
        var ti;

				// If the Loda element exists
        if (ts) {

					// Get the Loda ID stored in the element
            ti = ts.getAttribute("loda-id");
            L.LODA_ID = ti;

						// See if there's a proxy to use
            var serv = ts.getAttribute('loda-proxy');
            L.SERVER = serv || "https://api.loda.rocks";
            L.USING_PROXY = serv;
        }

				// If Loda's ID or a proxy has been set, poll the server or proxy for RML data
        if (typeof L.LODA_ID == "string" || L.USING_PROXY) {
            if (L.loadedFor.indexOf(location.href) < 0) {
                L.pollServer(location.href, null);
                L.loadedFor.push(location.href);
            }
        }

				// Dispatch page-prepped event
        V(
            "page-prepped"
        );

				// Page is loaded
        L.loaded = true;
    };

		// Trigger the loader on page load
    L.load(L.loader);

    /**
		 * @function pollServer
		 * @memberof Loda
		 * @description Retrieve RML data from server. Only called if Loda ID or proxy is provided.
		 * If a proxy is set, Loda will poll the proxy instead of the server directly for RML data.
		 * This allows webmasters to store the Loda ID in the proxy instead of the client and
		 * to filter out spoofed requests to pages that don't exist.
		 * @param {string} e - page to get RML data for
		 * @param {string} f - URL of page to grab RML data for, leave null for current page
		 */
    L.pollServer = (e, f) => {

			// Prep server request
        var x = new XMLHttpRequest();
        x.addEventListener("load", () => {

					// Parse server response
					// Response will always be JSON, even in the case of errors
            var res = JSON.parse(x.response);

						// Get the pages the RML or DML recommends caching, currently the top five
            var urls = res.pages;
            if (urls) {

							// Cache all of them
                for (url of urls) {
                    L.cachePage(url);
                }

            } else {

							// Uh oh! There's an error. Let's tell everyone!
                V('api-error', {
                    'error': res.err
                })
            }
        });

				// Force the required URL to be formatted properly
        var a = document.createElement("a");
        a.href = e;

				// Data to send to server in POST body
				// action: the thing you want the API to do
				// current_page: whatever page you want the RML or DML data for
				// api_key: the Loda ID grabbed from the loda-script object
				//    by sending the request to a proxy, you can have the proxy
				//    append the Loda ID once the request is verified by your system
        var data = {
            action: "loading_page",
            current_page: a.href,
            api_key: L.LODA_ID
        };

				// If you want to grab the RML data for a page you're not currently on
        if (f) {
            a.href = f;
            data.last_page = a.href;
        }

				// Send the request
        x.open("POST", L.SERVER);
        x.send(JSON.stringify(data));

				// Deprecated, will be removed in next version
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

    /**
		 * @function clickLink
		 * @memberof Loda
		 * @description Called when a user clicked on a Loda-enabled anchor.
		 * @param {MouseEvent|string} e - click event or URL to explicitly follow
		 */
    L.clickLink = e => {

			// This will contain the URL to load
        var d;

				// If e is a URL, we're good
        if (typeof e == `string`) d = e;

				// If e is a click event, get the URL from it
        else {
					// Get the element clicked
            var d = e.target;

						// If e is a click event with button > 1 (not left click)
            if (e.button) {
							// Don't interfere with the click
                return;

								// If it's a left-click
            } else if(e.button === 0) {

							// Cancel it
              e.preventDefault();
            }

						// Trigger a spooling animation if the page takes too long to load
            makeDeferredPageLoadSpooler();

						// Climb ancestors until an anchor is found
						//    Useful when a span is clicked inside a Loda-boosted anchor
            while (d && !d.href) d = d.parentNode;

						// Get the URL to load
            d = d.href;
        }

				// d now contains a URL one way or antoher

				// Store the last page in a temp variable
        var last_page = L.LAST_PAGE;

				// Load the new page
        L.loadPage(d);

				// Poll the server for new RML/DML data
				// Note: might need to play with the variable a bit to fix a bug
        if (typeof L.LODA_ID == "string") L.pollServer(d, last_page);
    };

    /**
		 * @function loadPage
		 * @memberof Loda
		 * @description Retreives a page for preloading.
		 * @param {string} e - the page to load
		 * @param {bool} pop - whether to show the page
		 */
    L.loadPage = (e, pop) => {

			// Set the last page variable to the current page
        L.LAST_PAGE = e;

				// If the current page is cached
        if (L.cache[e])

					// Display the page
            setTimeout(() => {
                L.showPage(e, pop);
            }, 0);
				// Otherwise, cache the page and try again
        else L.cachePage(e, true, pop);
    };

		/**
		 * @function makeDeferredPageLoadSpooler
		 * @memberof Loda
		 * @description Show a page spooling animation if a load is taking too long.
		 * Currently non-functional
		 */
    function makeDeferredPageLoadSpooler() {
        if (!L.deferredPageLoadSpooler) {
            L.deferredPageLoadSpooler = setTimeout(() => {
                var b = document.body;
                b.style.cursor = "none";
                b.style.pointerEvents = "none";
                b.style.opacity = .5;
            }, 500)
        }
    }

    /**
		 * @function startHover
		 * @memberof Loda
		 * @description Called when the movement prediction detects a hover.
     * If the hovered element (or ancestor) has an href, preload it.
		 */
    L.startHover = e => {

			// Get the hovered element
        var d = e.target;

				// Climb ancestors until you see one with an href
        while (
            d &&
            typeof d.getAttribute == "function" &&
            !d.href
        )
            d = d.parentNode;

				// If the element exists and we can get an attribute from it
				// Note: getAttribute is leftover from an older Loda version. Purge.
        if (d && typeof d.getAttribute == "function") {

					// Get the anchor's href
            d = d.href;

						// Clear any cache timers
            if (L.cacheTimer) {
                clearTimeout(L.cacheTimer);
            }

						// Cache the page on a slight delay
						// Set the delay to higher to reduce unnecessary page caches
            L.cacheTimer = setTimeout(() => {
                L.cachePage(d);
            }, 0);
        }
    };

		/**
		 * @function endHover
		 * @memberof Loda
		 * @description If the hover stops, cancel the page cache.
		 * @param {MouseEvent|CustomEvent} e - the mouse or FTL event. Unused. Purge.
		 */
    L.endHover = e => {
        if (L.cacheTimer) {
            clearTimeout(L.cacheTimer);
        }
    };

    /**
		 * @function cachePage
		 * @memberof Loda
		 * @description Cache a page if it is not already cached or being cached.
		 * @param {string} page - the page to load
		 * @param {bool} show - whether to show the page
		 * @param {bool} pop - whether to pop states
		 */
    L.cachePage = (page, show, pop) => {

			// If we're going to show the page, queue it and alert the masses
        if (show) {
            L.queuedPage = page;
            V(
                "page-queued", {
                    page: page
                        /* Will eventually include the link that was clicked */
                }
            );
        }

				// If the page is already being cached, don't do anything
        if (L.caching[page]) return;

				// Now caching the page
        L.caching[page] = true;

				// Get the stored copy of the requested page
        var sp = L.storedPageFor(page);

				// Some permacaching magic
        if (
            L.getSiteVersion() > -1 &&
            sp &&
            sp.version >= L.getSiteVersion()
        ) {
					// Load the page from permacache (localStorage) and alert the masses
            L.cache[page] = sp.content;
            V(
                "permacache-hit", {
                    page: page
                }
            );

						// Show the permacached page
            if (L.queuedPage) L.showPage(page, pop);
        } else {

					// Page not in permacache, need to fetch it from the web server

					// Prep request
            var x = new XMLHttpRequest();
            x.addEventListener("load", () => {

							// Page gotten. Alert the masses
                L.cache[page] = x.response;
                V(
                    "page-cached", {
                        page: page,
                        content: x.content
                    }
                );

								// Delete old cache items until there's enough room for the new page
                L.cleanCache(x.response.length);

								// If permacaching is enabled, store the page in localStorage
                if (L.getSiteVersion() > -1 && (L.cacheSize() + x.response.length < 4000000)) {
                    localStorage.setItem(
                        page,
                        JSON.stringify({
                            content: x.response,
                            version: L.getSiteVersion(),
                            date: +new Date(),
                            last_used: +new Date(),
                            owner: "Loda"
                        })
                    );

										// Alert the masses! Page has been cached!
                    V(
                        "page-permacached"
                    );
                }

								// Show the page already
                if (L.queuedPage) L.showPage(L.queuedPage, pop);
            });

						// Send the request for the page to the web server
            x.open("GET", page);
            x.send();
        }
    };

    /**
		 * @function showPage
		 * @memberof Loda
		 * @description Display a cached page.
		 * @param {string} page - the page to show
		 * @param {bool} pop - whether to pop states
		 */
    L.showPage = (page, pop) => {

			// HTML to display
        var html;

				// If the page exists, display it
        if (page) {

					// Set the HTML to the cached copy of the page
            html = L.cache[page];

						// Display the new page
            window.document.open();
            window.document.write(html);
            window.document.close();

						// Pop state if necessary
            if (!pop)
                history.pushState({
                        page: page
                    },
                    null,
                    page
                );
						// Trigger the loader function once page is written to DOM
            setTimeout(() => {
                L.loader();
            }, 0);
        } else {
            // If page is not cached, cache it
            cachePage("index.html", true, true);
        }
    };

    /**
		 * @function popPage
		 * @memberof Loda
		 * @description Reload the page to clear the cache if the user clicks back or next.
		 * // WARNING: contains faulty code. Repair or purge.
		 * @param {purge} o - unused. Purge.
		 */
    L.popPage = o => {
        //location.reload();
        //alert(JSON.stringify(o.state))
        if (event.state === null /*L.changingHash*/ && L.changingHash) {
            L.changingHash = false;
            //alert();
        } else {
            location.reload();
        }

    };

		/**
		 * @function ignoreNav
		 * @memberof Loda
		 * @description Ignore the user's navigation if it's just to a different hash on the same page.
		 * @param {purge} o - unused. Purge.
		 */
    L.ignoreNav = o => {
        L.changingHash = true;
    }

    /**
		 * @function sum
		 * @memberof Loda
		 * @description Sum two coordinates.
		 * Unused now that FTL handles cursor prediction. Purge.
		 */
    L.sum = (posa, posb) => {
        return {
            x: posa.x + posb.x,
            y: posa.y + posb.y
        };
    };

    /**
		 * Log something to the #log box if one exists.
		 * @param {string|object} text - HTML or object to log.
		 */
    L.log = text => {
        if (!L.logbox) L.logbox = L.grab("log");
        if (L.logbox)
            L.logbox.innerHTML =
            typeof text === "object" ? JSON.stringify(text) : text;
    };

		/**
		 * @function getSiteVersion
		 * @memberof Loda
		 * @description Get the site version for permacaching purposes.
		 */
    L.getSiteVersion = () => {
        var ts = L.grab("loda-script");

        return ts ? ts.getAttribute("site-version") || -1 : -1;
    };

		/**
		 * @function storedPageFor
		 * @memberof Loda
		 * @description Get a permacached page from localStorage.
		 * @param {string} page - the page to grab from localStorage
		 */
    L.storedPageFor = page => {
        var data = localStorage.getItem(page);
        try {
            data = JSON.parse(data);
        } catch (ex) {}
        return data || 0;
    };


		/**
		 * @function cacheSize
		 * @memberof Loda
		 * @description Get the amount of data stored in localStorage.
		 */
    L.cacheSize = () => {
        var cacheSize = 0;
        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var k = localStorage.key(i);
            var v = localStorage.getItem(k);
            var data;
            try {
                data = JSON.parse(v);
            } catch (ex) {
                continue;
            }
            if (data.owner == "Loda") {
                cacheSize += data.content.length;
            }
        }
        return cacheSize;
    }

		/**
		 * @function cleanCache
		 * @memberof Loda
		 * @description Delete cache items until a certain amount of free space is left.
		 * @param {number} extra - the amount of space needed in cache
		 */
    L.cleanCache = (extra) => {
        var cacheSize = L.cacheSize();
        while (cacheSize + extra > 4000000 && cacheSize > 0) {
            var cacheSize = 0;
            var earliestDate = +new Date();
            var earliestId;
            for (var i = 0, len = localStorage.length; i < len; ++i) {
                var k = localStorage.key(i);
                var v = localStorage.getItem(k);
                var data;
                try {
                    data = JSON.parse(v);
                } catch (ex) {
                    continue;
                }
                if (data.owner == "Loda") {
                    cacheSize += data.content.length;
                    if (data.last_used < earliestDate) {
                        earliestDate = data.last_used;
                        earliestId = k;
                    }
                }
            }
            if (earliestId) {
                localStorage.removeItem(earliestId);
                V(
                    "cache-trimmed", {
                        page: earliestId
                    }
                )
            }

        }

				// Alert the masses, the cache has been cleaned
        V(
            "cache-cleaned"
        );

    }

		/**
		 * @function fload
		 * @memberof Loda
		 * @description Prototype function for enhanced XHR requests on page load.
		 * Not currently used. Purge.
		 */
    L.fload = (url, body, expectJson, params) => {
        var state = 0,
            data = {},
            json, succCb, failCb, response, fetchComplete, domLoaded;
        if (typeof body == 'object') {
            body = JSON.stringify(body);
            json = true;
        }
        if (params) data = params;
        if (typeof body == 'string') {
            data.method = 'POST';
            data.body = body;
        }

        this.then = function(cb) {
            succCb = cb;
            return this;
        }

        this.fail = function(cb) {
            failCb = cb;
            return this;
        }
        fetch(url, data)
            .then(res => {
                if (res.ok)
                    (expectJson ? res.json() : res.text())
                    .then(res => {
                        fetchComplete = true;
                        trySuccess(res)
                    }).catch(res => {
                        if (failCb) failCb(res);
                        else throw new Error(res)
                    })
                else if (fail) fail('Error fetching request.')
                else throw new Error('Error fetching request.');
            }).catch(res => {
                if (failCb) failCb(res);
                else throw new Error(res)
            })

        function trySuccess(res) {
            if (res) response = res;
            state++;
            if (response && (domLoaded || L.domLoaded)) {
                if (succCb) succCb(response);
            }
        }
        L.bind(window, 'DOMContentLoaded', e => {
            domLoaded = true;
            trySuccess()
        })
        return this;
    }

		// Set the domLoaded variable when the DOM is... well... loaded
    L.bind(window, 'DOMContentLoaded', e => {
        L.domLoaded = true;
    })

		// Set the global Loda variable
    Loda = L;

}
