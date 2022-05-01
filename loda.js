/**
 * This section is FTjs from ftl.rocks, another Airgap project.
 * GitHub: https://github.com/airgap/ftl
 */
(function () {
    // The element currently anticipated to be hovered over
    var _prehoveredElement, 
    // The cursor's last position, defaults to 0,0
    _lastPos = {
        'x': 0,
        'y': 0
    }, 
    // The cursor's current location, defaults to 0,0
    _cursorPos = {
        'x': 0,
        'y': 0
    }, 
    // Minification helpers
    _Math = Math, _pow = _Math.pow, _document = document, _parentNode = 'parentNode', _classList = 'classList', _prehoverClass = 'prehover', 
    // Ensure -200 <= value <= 200
    _lock200 = function (_value) { return _Math.min(200, _Math.max(-200, _value)); }, 
    // Create an event of [type] with [detail] and dispatch it on [element]
    _dispatchEventOnElement = function (_element, _type, _detail) {
        return _element.dispatchEvent(new CustomEvent(_type, {
            'detail': _detail
        }));
    }, 
    // Analyze a prediction and trigger appropriate events on the predicted element
    _analyzePrediction = function (_prediction) {
        // Get the element at the foreseen position
        var _elementAtPoint = _document.elementFromPoint(_prediction.x, _prediction.y), 
        // The ancestors of the foreseen element
        _prehoveredAncestors = [], 
        // The ancestors of the last forseen element
        _lastAncestors = [], 
        // The element each portion of this method is currently focusing on
        // Starts as the last foreseen element
        _currentElement = _prehoveredElement;
        // if (the last foreseen element exists) and either
        // ((the new foreseen element doesn't exist) or (is equal to the last foreseen element))
        if (_prehoveredElement && (!_elementAtPoint || _elementAtPoint !== _prehoveredElement)) {
            // Remove the last foreseen element's 'prehover' class
            _prehoveredElement[_classList].remove(_prehoverClass);
            // Dispatch an event on the element saying it is no longer foreseen as being hovered over
            _dispatchEventOnElement(_prehoveredElement, "erphover");
        }
        // if (the new foreseen element exists) and is not equal to the last foreseen element
        if (_elementAtPoint && _prehoveredElement !== _elementAtPoint) {
            // Push each ancestor of the last foreseen element to an array
            while (_currentElement)
                _lastAncestors.push(_currentElement = _currentElement[_parentNode]);
            // Now focus on the new foreseen element
            _currentElement = _elementAtPoint;
            // Push each ancestor of the new foreseen element to an array
            while (_currentElement)
                _prehoveredAncestors.push(_currentElement = _currentElement[_parentNode]);
            // Iterate over each of the old foreseen element's ancestors
            for (var _i = 0, _lastAncestors_1 = _lastAncestors; _i < _lastAncestors_1.length; _i++) {
                _currentElement = _lastAncestors_1[_i];
                // If the element exists and is not also an ancestor of the new prehovered element...
                if (_currentElement && _prehoveredAncestors.indexOf(_currentElement) < 0) {
                    // ...remove its 'prehover' class
                    _currentElement[_classList].remove(_prehoverClass);
                }
            }
            // Iterate over each of the new foreseen element's ancestors
            for (var _a = 0, _prehoveredAncestors_1 = _prehoveredAncestors; _a < _prehoveredAncestors_1.length; _a++) {
                _currentElement = _prehoveredAncestors_1[_a];
                // If the element exists and is not a member of the old element's ancestors...
                if (_currentElement && _currentElement[_classList] && _lastAncestors.indexOf(_currentElement) < 0) {
                    // ...give it the 'prehover' class
                    _currentElement[_classList].add(_prehoverClass);
                }
            }
            // Give the new foreseen element itself the 'prehover' class
            _elementAtPoint[_classList].add(_prehoverClass);
            // Dispatch the 'prehover' event on the new foreseen element,
            // including the confidence level as the detail
            _dispatchEventOnElement(_elementAtPoint, _prehoverClass, {
                'd': _prediction.d
            });
            // Store the new foreseen element for future use (it is now the 'last' foreseen element)
            _prehoveredElement = _elementAtPoint;
        }
    }, 
    // Generate a predicted hover location based on the mouse's current and last positions
    _generatePrediction = function () {
        var 
        // Subtract the old X and Y coords from the new X and Y coords and multiply the result by 4
        // to get the relative position of the foreseen location from the current cursor location
        _delta = {
            'x': _lock200((_cursorPos.x - _lastPos.x) * 4),
            'y': _lock200((_cursorPos.y - _lastPos.y) * 4)
        }, 
        // Add the relative foreseen location to the current absolute location to get the absolute
        // foreseen mouse location
        _predictedPos = {
            'x': _cursorPos.x + _delta.x,
            'y': _cursorPos.y + _delta.y,
            'd': _pow(_pow(_delta.x, 2) + _pow(_delta.y, 2), .5) // Inverse confidence
        };
        // Dispatch the 'precursormove' event on the document, including the x, y, and confidence values
        _dispatchEventOnElement(_document, "precursormove", {
            'x': _predictedPos.x,
            'y': _predictedPos.y,
            'd': _predictedPos.d
        });
        // Analyze the prediction to trigger the appropriate 'prehover' and 'erphover' events and assign
        // the 'prehover' class to the appropriate elements
        _analyzePrediction(_predictedPos);
        // Store the current mouse location for later use (it is now the 'last' location)
        _lastPos = _cursorPos;
    }, 
    // Handle mousemove events on an element (here it's the document)
    _processMouseMove = function (_event) {
        // Update the current mouse location
        _cursorPos = {
            'x': _event.clientX,
            'y': _event.clientY
        };
        // Generate a prediction based on the current mouse location
        _generatePrediction();
    };
    //Bind that event handler to the document's 'mousemove' event
    _document.addEventListener("mousemove", _processMouseMove);
})();
// End of FTjs
// Now for the actual Loda script:
/*
// This is used for debugging during the Beta.
console.log('Loda? ', window['Loda']);
window['Loda'] = true;
*/
/**
 * Dispatch a custom event on the document object
 * @param {text} event - event type
 * @param {object} detail - event detail
 */
var dispatchEventOnDocument = function (event, detail) {
    document.dispatchEvent(new CustomEvent(event, {
        'detail': detail
    }));
};
//Is true if the hash is currently being changed
var changingHash;
var domLoaded = false;
//Is true if the load binder is trying to run
var binderTimeout;
//Loaded first time
var loaded = false;
//Cache of downloaded pages.
var pageCache = {};
//Pages that are currently being cached.
var cachingPages = {};
//Pages that already have the RML-generated list of pages to pageCache retrieved.
var loadedFor = [];
//Used for time-delay hover cachingPages. Currently unused.
var cacheTimer;
//Automatically set by retrieving value from the Loda script tag.
//Required for RML, and requires Loda account.
//Not required for any other features.
var LODA_ID;
//Keeps track of what page was just navigated away from.
var LAST_PAGE;
//Keeps track of hash changes to ignore popState
var ignoreNav;
//Stores the page that will be shown after load if link is clicked.
var queuedPage;
//Override this to pass API calls through a custom proxy to protect your
//API key and to allow you to filter requests to prevent DoS and other abuse
var SERVER = "https://api.loda.rocks";
var USING_PROXY = false;
var deferredPageLoadSpooler;
//Helper functions. Soon to be replaced.
/**
 * @function grab
 * @memberof Loda
 * @description Get an element or elements by their IDs.
 * @param {Element} elem - string containing id or pipe-separated id list
 * @returns Element or array of Elements
 */
var grab = function (elem) { return typeof elem === 'string' ? document.getElementById(elem) : elem; };
/**
 * @function bind
 * @memberof Loda
 * @description Bind a function to an event.
 * @param {} emitter - the emitting object to bind to
 * @param {string} trigger - the event to listen to
 * @param {function} func - the function to trigger
 */
var bind = function (emitter, trigger, func) { return emitter.addEventListener(trigger, func); };
/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
var load = function (func) { return bind(window, "DOMContentLoaded", func); };
/**
 * @function loader
 * @memberof Loda
 * @description Runs on page load. Prepares for Loda initialization.
 */
var loader = function () {
    // Prevent any spooling animations from displaying
    if (deferredPageLoadSpooler) {
        clearTimeout(deferredPageLoadSpooler);
        deferredPageLoadSpooler = null;
    }
    // Dispatch the page-loading event
    dispatchEventOnDocument('page-loading', {
        cache: pageCache
    });
    // Clear and renew the Loda initialization delay
    if (binderTimeout) {
        clearTimeout(binderTimeout);
    }
    binderTimeout = setTimeout(actualLoader, 10);
};
/**
 * @function actualLoader
 * @memberof Loda
 * @description Initialize Loda.
 */
var actualLoader = function () {
    // If no body exists, retry initialization
    if (!document.body) {
        loader();
        return;
    }
    // Manually trigger load events
    if (loaded) {
        dispatchEventOnDocument('page-loaded');
        [document, window].forEach(function (d) {
            d.dispatchEvent(new UIEvent("load"));
        });
    }
    // Remember this page for when the user navigates away
    LAST_PAGE = location.href;
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
    if (srcHashPos == -1)
        srcHashPos = location.href.length;
    var _loop_1 = function (i) {
        // Get the current link's href
        var lh = links[i].href;
        // Get its hash's location in the URL
        var destHashPos = lh.indexOf("#");
        // If no hash exists, pretend there's one at the end
        if (destHashPos == -1)
            destHashPos = lh.length;
        // If the link is actually a link and...
        //   doesn't have loda-disabled and...
        //   starts with a valid protocol and...
        //   doesn't have a target set and...
        //   I'm not sure what this next bit does and...
        //   the target domain is the current domain
        if (links[i].href &&
            !links[i].getAttribute('loda-bound') &&
            !links[i].getAttribute('loda-disabled') &&
            links[i].href.match(/^https?:\/\//) &&
            !links[i].getAttribute('target') &&
            ((location.href.match(/^(.+?):\/\//) || [0])[1] == (lh.match(/^(.+?):\/\//) || [0])[1]) &&
            links[i].href.match(new RegExp("^https?://" + srcDomain + "([:/#]|$)"))) {
            // Ensure the target page is not the active page,
            //   i.e. links to the same page will just trigger reload per usual
            if (lh.substring(0, destHashPos) != location.href.substring(0, srcHashPos)) { //Different page
                // Trigger Loda's cachingPages function on the link if FTL foresees a hover
                links[i].addEventListener('prehover', function () {
                    startHover({
                        target: links[i]
                    });
                });
                // Load the page from pageCache when the link is clicked down upon
                links[i].addEventListener("mousedown", clickLink);
                // Still don't know for sure what this does
                a.href = links[i].getAttribute("href");
                // Mark this link as accelerated by Loda
                links[i].setAttribute("loda-bound", "true");
            }
            else { //Just a hash change...probably
                links[i].addEventListener('click', ignoreNav);
            }
        }
    };
    // Iterate over all links on the current page
    for (var i = 0; i < links.length; i++) {
        _loop_1(i);
    }
    // Find an element, probably the <script> reffing Loda, tagged as the Loda config
    var ts = grab("loda-script");
    // Variable to store the site's Loda ID
    var ti;
    // If the Loda element exists
    if (ts) {
        // Get the Loda ID stored in the element
        ti = ts.getAttribute("loda-id");
        LODA_ID = ti;
        // See if there's a proxy to use
        var server = ts.getAttribute('loda-proxy');
        SERVER = server || "https://api.loda.rocks";
        USING_PROXY = !!server;
    }
    // If Loda's ID or a proxy has been set, poll the server or proxy for RML data
    if (typeof LODA_ID == "string" || USING_PROXY) {
        if (loadedFor.indexOf(location.href) < 0) {
            pollServer(location.href, null);
            loadedFor.push(location.href);
        }
    }
    // Dispatch page-prepped event
    dispatchEventOnDocument("page-prepped");
    // Page is loaded
    loaded = true;
};
// Trigger the loader on page load
load(loader);
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
var pollServer = function (e, f) {
    // Prep server request
    var x = new XMLHttpRequest();
    x.addEventListener("load", function () {
        // Parse server response
        // Response will always be JSON, even in the case of errors
        var res = JSON.parse(x.response);
        // Get the pages the RML or DML recommends cachingPages, currently the top five
        var urls = res.pages;
        if (urls) {
            // Cache all of them
            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var url = urls_1[_i];
                cachePage(url);
            }
        }
        else {
            // Uh oh! There's an error. Let's tell everyone!
            dispatchEventOnDocument('api-error', {
                'error': res.err
            });
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
        api_key: LODA_ID
    };
    // If you want to grab the RML data for a page you're not currently on
    if (f) {
        a.href = f;
        data['last_page'] = a.href;
    }
    // Send the request
    x.open("POST", SERVER);
    x.send(JSON.stringify(data));
};
/**
 * @function clickLink
 * @memberof Loda
 * @description Called when a user clicked on a Loda-enabled anchor.
 * @param {MouseEvent|string} e - click event or URL to explicitly follow
 */
var clickLink = function (e) {
    // This will contain the URL to load
    var element;
    // If e is a URL, we're good
    if (typeof e == "string")
        element = e;
    // If e is a click event, get the URL from it
    else {
        // Get the element clicked
        element = e.target;
        // If e is a click event with button > 1 (not left click)
        if (e.button) {
            // Don't interfere with the click
            return;
            // If it's a left-click
        }
        else if (e.button === 0) {
            // Cancel it
            e.preventDefault();
        }
        // Trigger a spooling animation if the page takes too long to load
        makeDeferredPageLoadSpooler();
        // Climb ancestors until an anchor is found
        //    Useful when a span is clicked inside a Loda-boosted anchor
        while (element && !element.href)
            element = element.parentNode;
        // Get the URL to load
        element = element.href;
    }
    // d now contains a URL one way or antoher
    // Store the last page in a temp variable
    var last_page = LAST_PAGE;
    // Load the new page
    loadPage(element);
    // Poll the server for new RML/DML data
    // Note: might need to play with the variable a bit to fix a bug
    if (typeof LODA_ID == "string")
        pollServer(element, last_page);
};
/**
 * @function loadPage
 * @memberof Loda
 * @description Retreives a page for preloading.
 * @param {string} e - the page to load
 * @param {boolean} pop - whether to show the page
 */
var loadPage = function (e, pop) {
    // Set the last page variable to the current page
    LAST_PAGE = e;
    // If the current page is cached
    if (pageCache[e])
        // Display the page
        setTimeout(function () {
            showPage(e, pop);
        }, 0);
    // Otherwise, pageCache the page and try again
    else
        cachePage(e, true, pop);
};
/**
 * @function makeDeferredPageLoadSpooler
 * @memberof Loda
 * @description Show a page spooling animation if a load is taking too long.
 * Currently non-functional
 */
function makeDeferredPageLoadSpooler() {
    if (!deferredPageLoadSpooler) {
        deferredPageLoadSpooler = setTimeout(function () {
            var b = document.body;
            b.style.cursor = "none";
            b.style.pointerEvents = "none";
            b.style.opacity = '.5';
        }, 500);
    }
}
/**
 * @function startHover
 * @memberof Loda
 * @description Called when the movement prediction detects a hover.
 * If the hovered element (or ancestor) has an href, preload it.
 */
var startHover = function (e) {
    // Get the hovered element
    var element = e.target;
    // Climb ancestors until you see one with an href
    while (element &&
        typeof element.getAttribute == "function" &&
        !element.href)
        element = element.parentNode;
    // If the element exists and we can get an attribute from it
    // Note: getAttribute is leftover from an older Loda version. Purge.
    if (element && typeof element.getAttribute == "function") {
        // Get the anchor's href
        element = element.href;
        // Clear any pageCache timers
        if (cacheTimer) {
            clearTimeout(cacheTimer);
        }
        // Cache the page on a slight delay
        // Set the delay to higher to reduce unnecessary page caches
        cacheTimer = setTimeout(function () {
            cachePage(element);
        }, 0);
    }
};
/**
 * @function cachePage
 * @memberof Loda
 * @description Cache a page if it is not already cached or being cached.
 * @param {string} page - the page to load
 * @param {boolean} show - whether to show the page
 * @param {boolean} pop - whether to pop states
 */
var cachePage = function (page, show, pop) {
    // If we're going to show the page, queue it and alert the masses
    if (show) {
        queuedPage = page;
        dispatchEventOnDocument("page-queued", {
            page: page
            /* Will eventually include the link that was clicked */
        });
    }
    // If the page is already being cached, don't do anything
    if (cachingPages[page])
        return;
    // Now cachingPages the page
    cachingPages[page] = true;
    // Get the stored copy of the requested page
    var sp = storedPageFor(page);
    // Some permacaching magic
    if (getSiteVersion() > -1 &&
        sp &&
        sp['version'] >= getSiteVersion()) {
        // Load the page from permacache (localStorage) and alert the masses
        pageCache[page] = sp['content'];
        dispatchEventOnDocument("permacache-hit", {
            page: page
        });
        // Show the permacached page
        if (queuedPage)
            showPage(page, pop);
    }
    else {
        // Page not in permacache, need to fetch it from the web server
        // Prep request
        var x_1 = new XMLHttpRequest();
        x_1.addEventListener("load", function () {
            // Page gotten. Alert the masses
            pageCache[page] = x_1.response;
            dispatchEventOnDocument("page-cached", {
                page: page,
                content: x_1['content']
            });
            // Delete old pageCache items until there's enough room for the new page
            cleanCache(x_1.response.length);
            // If permacaching is enabled, store the page in localStorage
            if (getSiteVersion() > -1 && (getCacheSize() + x_1.response.length < 4000000)) {
                localStorage.setItem(page, JSON.stringify({
                    content: x_1.response,
                    version: getSiteVersion(),
                    date: +new Date(),
                    last_used: +new Date(),
                    owner: "Loda"
                }));
                // Alert the masses! Page has been cached!
                dispatchEventOnDocument("page-permacached");
            }
            // Show the page already
            if (queuedPage)
                showPage(queuedPage, pop);
        });
        // Send the request for the page to the web server
        x_1.open("GET", page);
        x_1.send();
    }
};
/**
 * @function showPage
 * @memberof Loda
 * @description Display a cached page.
 * @param {string} page - the page to show
 * @param {boolean} pop - whether to pop states
 */
var showPage = function (page, pop) {
    // HTML to display
    var html;
    // If the page exists, display it
    if (page) {
        // Set the HTML to the cached copy of the page
        html = pageCache[page];
        if (!html)
            return;
        // Display the new page
        window.document.open();
        window.document.write(html);
        window.document.close();
        console.log('OPENED WROTE CLOSED', html);
        // Pop state if necessary
        if (!pop)
            history.pushState({
                page: page
            }, null, page);
        // Trigger the loader function once page is written to DOM
        setTimeout(function () {
            loader();
        }, 0);
    }
    else {
        // If page is not cached, pageCache it
        cachePage("index.html", true, true);
    }
};
/**
 * @function popPage
 * @memberof Loda
 * @description Reload the page to clear the pageCache if the user clicks back or next.
 * // WARNING: contains faulty code. Repair or purge.
 * @param {} o - unused. Purge.
 */
var popPage = function (o) {
    //location.reload();
    //alert();
    //alert(JSON.stringify(o.state))
    if (o.state === null /*changingHash*/ && changingHash) {
        changingHash = false;
        //alert();
    }
    else {
        location.reload();
    }
};
/**
 * @function ignoreNav
 * @memberof Loda
 * @description Ignore the user's navigation if it's just to a different hash on the same page.
 */
ignoreNav = function () {
    changingHash = true;
};
/**
 * @function getSiteVersion
 * @memberof Loda
 * @description Get the site version for permacaching purposes.
 */
var getSiteVersion = function () {
    var ts = grab("loda-script");
    return ts ? ts.getAttribute("site-version") || -1 : -1;
};
/**
 * @function storedPageFor
 * @memberof Loda
 * @description Get a permacached page from localStorage.
 * @param {string} page - the page to grab from localStorage
 */
var storedPageFor = function (page) {
    var data = localStorage.getItem(page);
    return data ? JSON.parse(data) : 0;
};
/**
 * @function cacheSize
 * @memberof Loda
 * @description Get the amount of data stored in localStorage.
 */
var getCacheSize = function () {
    var cacheSize = 0;
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        var data = void 0;
        try {
            data = JSON.parse(v);
        }
        catch (ex) {
            continue;
        }
        if (data.owner == "Loda") {
            cacheSize += data.content.length;
        }
    }
    return cacheSize;
};
/**
 * @function cleanCache
 * @memberof Loda
 * @description Delete pageCache items until a certain amount of free space is left.
 * @param {number} extra - the amount of space needed in pageCache
 */
var cleanCache = function (extra) {
    var cacheSize = getCacheSize();
    while (cacheSize + extra > 4000000 && cacheSize > 0) {
        cacheSize = 0;
        var earliestDate = +new Date();
        var earliestId = void 0;
        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var k = localStorage.key(i);
            var v = localStorage.getItem(k);
            var data = void 0;
            try {
                data = JSON.parse(v);
            }
            catch (ex) {
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
            dispatchEventOnDocument("pageCache-trimmed", {
                page: earliestId
            });
        }
    }
    // Alert the masses, the pageCache has been cleaned
    dispatchEventOnDocument("pageCache-cleaned");
};
// Set the domLoaded variable when the DOM is... well... loaded
bind(window, 'DOMContentLoaded', function () {
    domLoaded = true;
});
//Listen for back and forward button clicks
try {
    window.removeEventListener("popstate", popPage);
}
catch (x) {
    console.log('popstate rebound');
}
window.addEventListener("popstate", popPage);
//alert('popPage bound')
