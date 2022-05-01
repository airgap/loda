import { CachedPage } from './CachedPage';
export declare class Loda {
    ignoreNav: boolean;
    binderTimeout?: number;
    loaded: boolean;
    pageCache: Map<string, string>;
    cachingPages: Set<string>;
    loadedFor: string[];
    lodaId?: string;
    LAST_PAGE?: string;
    queuedPage?: string;
    mlEndpoint: string;
    usingCustomMlEndpoint: boolean;
    deferredPageLoadSpooler?: number;
    /**
     * @function loader
     * @memberof Loda
     * @description Runs on page load. Prepares for Loda initialization.
     */
    loader: () => void;
    /**
     * @function actualLoader
     * @memberof Loda
     * @description Initialize Loda.
     */
    actualLoader: () => Promise<void>;
    /**
     * @function clickLink
     * @memberof Loda
     * @description Called when a user clicked on a Loda-enabled anchor.
     * @param {MouseEvent|string} event - click event or URL to explicitly follow
     */
    clickLink: (event: string | MouseEvent) => Promise<void>;
    /**
     * @function loadPage
     * @memberof Loda
     * @description Retrieves a page for preloading.
     * @param {string} page - the page to load
     * @param {boolean} pop - whether to show the page
     */
    loadPage: (page: string, pop?: boolean | undefined) => void;
    /**
     * @function makeDeferredPageLoadSpooler
     * @memberof Loda
     * @description Show a page spooling animation if a load is taking too long.
     * Currently non-functional
     */
    makeDeferredPageLoadSpooler: () => void;
    /**
     * @function cachePage
     * @memberof Loda
     * @description Cache a page if it is not already cached or being cached.
     * @param {string} page - the page to load
     * @param {boolean} show - whether to show the page
     * @param {boolean} pop - whether to pop states
     */
    cachePage: (page: string, show?: boolean | undefined, pop?: boolean | undefined) => Promise<void>;
    /**
     * @function showPage
     * @memberof Loda
     * @description Display a cached page.
     * @param {string} page - the page to show
     * @param {boolean} pop - whether to pop states
     */
    showPage: (page: string, pop?: boolean) => void;
    /**
     * @function popPage
     * @memberof Loda
     * @description Reload the page to clear the pageCache if the user clicks back or next.
     * // WARNING: contains faulty code. Repair or purge.
     * @param {} o - unused. Purge.
     */
    popPage: (o: {
        state: unknown;
    }) => void;
    /**
     * @function getSiteVersion
     * @memberof Loda
     * @description Get the site version for permacaching purposes.
     */
    getSiteVersion: () => string | -1;
    /**
     * @function storedPageFor
     * @memberof Loda
     * @description Get a permacached page from localStorage.
     * @param {string} page - the page to grab from localStorage
     */
    storedPageFor: (page: string) => CachedPage | 0;
    /**
     * @function cacheSize
     * @memberof Loda
     * @description Get the amount of data stored in localStorage.
     */
    getCacheSize: () => number;
    /**
     * @function cleanCache
     * @memberof Loda
     * @description Delete pageCache items until a certain amount of free space is left.
     * @param {number} extra - the amount of space needed in pageCache
     */
    cleanCache: (extra: number) => void;
    /**
     * @function pollServer
     * @memberof Loda
     * @description Retrieve RML data from server. Only called if Loda ID or proxy is provided.
     * If a proxy is set, Loda will poll the proxy instead of the server directly for RML data.
     * This allows webmasters to store the Loda ID in the proxy instead of the client and
     * to filter out spoofed requests to pages that don't exist.
     * @param {string} page - URL of page to get RML data for
     * @param {string} lastPage - URL of page to grab RML data for, leave null for current page
     */
    pollServer: (page: string, lastPage?: string | undefined) => Promise<void>;
    init: () => void;
    private handleHashChange;
}
