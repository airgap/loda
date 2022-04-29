import {ftl} from './ftl';

ftl();


import dispatchCustomEvent from './dispatchEventOnDocument';

//Helper functions. Soon to be replaced.

import grab from './grab';

import bind from './bind';
import dispatchEventOnDocument from "./dispatchEventOnDocument";
import runWhenDomReady from "./runWhenDomReady";
import getHashPos from "./getHashPos";

export class Loda {

//Is true if the hash is currently being changed

    changingHash: boolean = false;

    domLoaded = false;

//Is true if the load binder is trying to run
    binderTimeout?: number;

//Loaded first time
    loaded = false;

//Cache of downloaded pages.
    pageCache = new Map<string, string>();

//Pages that are currently being cached.
    cachingPages = new Set<string>();

//Pages that already have the RML-generated list of pages to pageCache retrieved.
    loadedFor: string[] = [];

//Used for time-delay hover cachingPages. Currently unused.
    cacheTimer?: number;

//Automatically set by retrieving value from the Loda script tag.
//Required for RML, and requires Loda account.
//Not required for any other features.
    LODA_ID?: string;

//Keeps track of what page was just navigated away from.
    LAST_PAGE?: string;

//Stores the page that will be shown after load if link is clicked.
    queuedPage?: string;

//Override this to pass API calls through a custom proxy to protect your
//API key and to allow you to filter requests to prevent DoS and other abuse
    SERVER = "https://api.loda.io";
    USING_PROXY = false;


    deferredPageLoadSpooler?: number;


    /**
     * @function loader
     * @memberof Loda
     * @description Runs on page load. Prepares for Loda initialization.
     */
    loader = () => {
        // Prevent any spooling animations from displaying
        if (this.deferredPageLoadSpooler) {
            clearTimeout(this.deferredPageLoadSpooler);
            this.deferredPageLoadSpooler = undefined;
        }

        // Dispatch the page-loading event
        dispatchEventOnDocument(
            'page-loading', {
                cache: this.pageCache
            }
        );

        // Clear and renew the Loda initialization delay
        if (this.binderTimeout) {
            clearTimeout(this.binderTimeout);
        }
        this.binderTimeout = window.setTimeout(this.actualLoader, 10);
    };

    /**
     * @function actualLoader
     * @memberof Loda
     * @description Initialize Loda.
     */
    actualLoader = () => {
        // If no body exists, retry initialization
        if (!document.body) {
            this.loader();
            return;
        }

        // Manually trigger load events
        if (this.loaded) {
            dispatchEventOnDocument('page-loaded');
            [document, window].forEach(d => {
                d.dispatchEvent(
                    new UIEvent(
                        "load"
                    )
                );
            })
        }

        // Remember this page for when the user navigates away
        this.LAST_PAGE = location.href;

        // Find all the anchors on the page
        const links = document.getElementsByTagName("a");

        // I can't remember what this does but I'm too scared to change it
        // Something about making sure a URL was correctly formatted
        const a = document.createElement("a");

        // Get the current domain
        const srcDomain = location.hostname;

        const srcHashPos = getHashPos();

        // Iterate over all links on the current page
        for (let i = 0; i < links.length; i++) {

            // Get the current link's href
            const lh = links[i].href;

            // Get its hash's location in the URL
            let destHashPos = lh.indexOf("#");

            // If no hash exists, pretend there's one at the end
            if (destHashPos == -1) destHashPos = lh.length;

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
                    links[i].addEventListener('prehover', () => {

                        // Just go with it okay
                        this.startHover(<MouseEvent><unknown>{
                            target: links[i]
                        });
                    });

                    // Load the page from pageCache when the link is clicked down upon
                    links[i].addEventListener("mousedown", this.clickLink);

                    // Still don't know for sure what this does
                    a.href = links[i].getAttribute("href") ?? '';

                    // Mark this link as accelerated by Loda
                    links[i].setAttribute("loda-bound", "true");

                } else { //Just a hash change...probably
                    links[i].addEventListener('click', this.ignoreNav);
                }
            }
        }

        // Find an element, probably the <script> reffing Loda, tagged as the Loda config
        const ts = grab("loda-script");

        // If the Loda element exists
        if (ts) {
            const id = ts.getAttribute("loda-id");
            if (id)
                this.LODA_ID = id;

            // See if there's a proxy to use
            const server = ts.getAttribute('loda-proxy');
            this.SERVER = server || "https://api.loda.rocks";
            this.USING_PROXY = !!server;
        }

        // If Loda's ID or a proxy has been set, poll the server or proxy for RML data
        if (typeof this.LODA_ID == "string" || this.USING_PROXY) {
            if (this.loadedFor.indexOf(location.href) < 0) {
                this.pollServer(location.href);
                this.loadedFor.push(location.href);
            }
        }

        // Dispatch page-prepped event
        dispatchEventOnDocument(
            "page-prepped"
        );

        // Page is loaded
        this.loaded = true;
    };

    /**
     * @function clickLink
     * @memberof Loda
     * @description Called when a user clicked on a Loda-enabled anchor.
     * @param {MouseEvent|string} e - click event or URL to explicitly follow
     */
    clickLink = (e: string | MouseEvent) => {

        // This will contain the URL to load
        let element;

        // If e is a URL, we're good
        if (typeof e == `string`) element = e;

        // If e is a click event, get the URL from it
        else {
            // Get the element clicked
            element = <Element>e.target;

            // If e is a click event with button > 1 (not left click)
            if (e.button) {
                // Don't interfere with the click
                return;

                // If it's a left-click
            } else if (e.button === 0) {

                // Cancel it
                e.preventDefault();
            }

            // Trigger a spooling animation if the page takes too long to load
            this.makeDeferredPageLoadSpooler();

            // Climb ancestors until an anchor is found
            //    Useful when a span is clicked inside a Loda-boosted anchor
            while (element && !element.hasAttribute('href')) element = <Element>element.parentNode;

            // Get the URL to load
            element = (<HTMLAnchorElement>element).href;
        }

        // d now contains a URL one way or antoher

        // Store the last page in a temp variable
        let last_page = this.LAST_PAGE;

        // Load the new page
        this.loadPage(element);

        // Poll the server for new RML/DML data
        // Note: might need to play with the variable a bit to fix a bug
        if (typeof this.LODA_ID == "string") this.pollServer(element, last_page);
    };

    /**
     * @function loadPage
     * @memberof Loda
     * @description Retreives a page for preloading.
     * @param {string} e - the page to load
     * @param {boolean} pop - whether to show the page
     */
    loadPage = (e: string, pop?: boolean) => {

        // Set the last page variable to the current page
        this.LAST_PAGE = e;

        // If the current page is cached
        if (this.pageCache.has(e))

            // Display the page
            setTimeout(() => {
                this.showPage(e, pop);
            }, 0);
        // Otherwise, pageCache the page and try again
        else this.cachePage(e, true, pop);
    };

    /**
     * @function makeDeferredPageLoadSpooler
     * @memberof Loda
     * @description Show a page spooling animation if a load is taking too long.
     * Currently non-functional
     */
    makeDeferredPageLoadSpooler = () => {
        if (!this.deferredPageLoadSpooler) {
            this.deferredPageLoadSpooler = window.setTimeout(() => {
                const b = document.body;
                b.style.cursor = "none";
                b.style.pointerEvents = "none";
                b.style.opacity = '.5';
            }, 500)
        }
    }

    /**
     * @function startHover
     * @memberof Loda
     * @description Called when the movement prediction detects a hover.
     * If the hovered element (or ancestor) has an href, preload it.
     */
    startHover = (e: MouseEvent) => {

        // Get the hovered element
        let element = <Element>e.target;

        // Climb ancestors until you see one with an href
        while (
            element
            && !element.hasAttribute('href')
            && element.parentNode
            )
            element = <Element>element.parentNode;

        // If the element exists and we can get an attribute from it
        // Note: getAttribute is leftover from an older Loda version. Purge.
        if (element && element.hasAttribute('href')) {

            // Get the anchor's href
            const href = element.getAttribute('href');
            if(!href)
                return;

            // Clear any pageCache timers
            if (this.cacheTimer) {
                clearTimeout(this.cacheTimer);
            }

            // Cache the page on a slight delay
            // Set the delay to higher to reduce unnecessary page caches
            this.cacheTimer = window.setTimeout(() => {
                this.cachePage(href);
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
    cachePage = async (page: string, show?: boolean, pop?: boolean) => {

        // If we're going to show the page, queue it and alert the masses
        if (show) {
            this.queuedPage = page;
            dispatchEventOnDocument(
                "page-queued", {
                    page: page
                    /* Will eventually include the link that was clicked */
                }
            );
        }

        // If the page is already being cached, don't do anything
        if (this.cachingPages.has(page)) return;

        // Now cachingPages the page
        this.cachingPages.add(page);

        // Get the stored copy of the requested page
        const sp = this.storedPageFor(page);

        // Some permacaching magic
        if (
            this.getSiteVersion() > -1 &&
            sp &&
            sp['version'] >= this.getSiteVersion()
        ) {
            // Load the page from permacache (localStorage) and alert the masses
            this.pageCache.set(page, sp['content']);
            dispatchEventOnDocument(
                "permacache-hit", {
                    page: page
                }
            );

            // Show the permacached page
            if (this.queuedPage) this.showPage(page, pop);
        } else {

            // Page not in permacache, need to fetch it from the web server

            // Prep request
            const bingbong = await (await fetch(page)).text();

                // Page gotten. Alert the masses
                this.pageCache.set(page, bingbong);
                dispatchEventOnDocument(
                    "page-cached", {
                        page: page,
                        content: bingbong
                    }
                );

                // Delete old pageCache items until there's enough room for the new page
                this.cleanCache(bingbong.length);

                // If permacaching is enabled, store the page in localStorage
                if (this.getSiteVersion() > -1 && (this.getCacheSize() + bingbong.length < 4000000)) {
                    localStorage.setItem(
                        page,
                        JSON.stringify({
                            content: bingbong,
                            version: this.getSiteVersion(),
                            date: +new Date(),
                            last_used: +new Date(),
                            owner: "Loda"
                        })
                    );

                    // Alert the masses! Page has been cached!
                    dispatchEventOnDocument(
                        "page-permacached"
                    );
                }

                // Show the page already
                if (this.queuedPage) this.showPage(this.queuedPage, pop);
        }
    };

    /**
     * @function showPage
     * @memberof Loda
     * @description Display a cached page.
     * @param {string} page - the page to show
     * @param {boolean} pop - whether to pop states
     */
    showPage = (page: string, pop = false) => {

        // HTML to display
        let html;

        // If the page exists, display it
        if (page) {

            // Set the HTML to the cached copy of the page
            html = this.pageCache.get(page);
            if (!html) return;

            // Display the new page
            window.document.open();
            window.document.write(html);
            window.document.close();
            console.log('OPENED WROTE CLOSED', html);

            // Pop state if necessary
            if (!pop)
                history.pushState({
                        page: page
                    },
                    '',
                    page
                );
            // Trigger the loader function once page is written to DOM
            setTimeout(() => {
                this.loader();
            }, 0);
        } else {
            // If page is not cached, pageCache it
            this.cachePage("index.html", true, true);
        }
    };

    /**
     * @function popPage
     * @memberof Loda
     * @description Reload the page to clear the pageCache if the user clicks back or next.
     * // WARNING: contains faulty code. Repair or purge.
     * @param {} o - unused. Purge.
     */
    popPage = (o : {state: unknown}) => {
        //location.reload();
        //alert();
        //alert(JSON.stringify(o.state))
        if (o.state === null /*changingHash*/ && this.changingHash) {
            this.changingHash = false;
            //alert();
        } else {
            location.reload();
        }

    };

    /**
     * @function ignoreNav
     * @memberof Loda
     * @description Ignore the user's navigation if it's just to a different hash on the same page.
     */
    ignoreNav = () => {
        this.changingHash = true;
    };

    /**
     * @function getSiteVersion
     * @memberof Loda
     * @description Get the site version for permacaching purposes.
     */
    getSiteVersion = () => {
        const ts = grab("loda-script");
        return ts ? ts.getAttribute("site-version") || -1 : -1;
    };

    /**
     * @function storedPageFor
     * @memberof Loda
     * @description Get a permacached page from localStorage.
     * @param {string} page - the page to grab from localStorage
     */
    storedPageFor = (page: string) => {
        let data = localStorage.getItem(page);
        return data ? JSON.parse(data) : 0;
    };


    /**
     * @function cacheSize
     * @memberof Loda
     * @description Get the amount of data stored in localStorage.
     */
    getCacheSize = () => {
        let cacheSize = 0;
        for (let i = 0, len = localStorage.length; i < len; ++i) {
            let k = localStorage.key(i);
            if(!k)
                continue;
            let v = localStorage.getItem(k);
            if(!v)
                continue;
            let data;
            try {
                data = JSON.parse(v);
            } catch (ex) {
                continue;
            }
            if (data.owner === "Loda") {
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
    cleanCache = (extra: number) => {
        let cacheSize = this.getCacheSize();
        while (cacheSize + extra > 4000000 && cacheSize > 0) {
            cacheSize = 0;
            let earliestDate = +new Date();
            let earliestId;
            for (let i = 0, len = localStorage.length; i < len; ++i) {
                const k = localStorage.key(i);
                if(!k)
                    continue;
                const v = localStorage.getItem(k);
                if(!v)
                    continue;
                let data;
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
                dispatchEventOnDocument(
                    "pageCache-trimmed", {
                        page: earliestId
                    }
                )
            }

        }

        // Alert the masses, the pageCache has been cleaned
        dispatchEventOnDocument(
            "pageCache-cleaned"
        );

    };
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
    pollServer = async (e: string, f?: string) => {

// Force the required URL to be formatted properly
        const a = document.createElement("a");
        a.href = e;

// Data to send to server in POST body
// action: the thing you want the API to do
// current_page: whatever page you want the RML or DML data for
// api_key: the Loda ID grabbed from the loda-script object
//    by sending the request to a proxy, you can have the proxy
//    append the Loda ID once the request is verified by your system
        const data: {
            action: string,
            current_page: string,
            api_key?: string,
            last_page?: string
        } = {
            action: "loading_page",
            current_page: a.href,
            api_key: this.LODA_ID
        };

// If you want to grab the RML data for a page you're not currently on
        if (f) {
            a.href = f;
            data.last_page = a.href;
        }

        // Parse server response
        // Response will always be JSON, even in the case of errors
        const res: { err: any, pages: string[] } = await (await fetch(this.SERVER, {
            body: JSON.stringify(data),
            method: 'POST',
        })).json();

        // Get the pages the RML or DML recommends cachingPages, currently the top five
        const urls = res.pages;
        if (urls) {

            // Cache all of them
            for (const url of urls) {
                this.cachePage(url);
            }

        } else {

            // Uh oh! There's an error. Let's tell everyone!
            dispatchEventOnDocument('api-error', {
                'error': res.err
            })
        }
    };


    init = () => {


        //Listen for back and forward button clicks
        try {
            window.removeEventListener("popstate", this.popPage);
        } catch (x) {
            console.log('popstate rebound');
        }
        window.addEventListener("popstate", this.popPage);
        //alert('popPage bound')

        // Trigger the loader on page load
        runWhenDomReady(this.loader);
    }

}

const loda = new Loda();
loda.init();