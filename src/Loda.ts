// Helper functions. Soon to be replaced.

import { grab } from './grab'

import { dispatchEventOnDocument } from './dispatchEventOnDocument'
import { runWhenDomReady } from './runWhenDomReady'
import { formatUrl } from './formatUrl'
import { CachedPage } from './CachedPage'
import { isAnchorLodaBound } from './isAnchorLodaBound'
import { isAnchorLodaDisabled } from './isAnchorLodaDisabled'
import { doesUrlHaveTarget } from './doesUrlHaveTarget'
import { doesUrlMatchProtocol } from './doesUrlMatchProtocol'
import { doProtocolsMatch } from './doProtocolsMatch'
import { isAnchorOfDomain } from './isAnchorOfDomain'
import { bind } from './bind'
import { nothing } from './nothing'
import { writeHtmlToDocument } from './writeHtmlToDocument'
import { doesLocalStorageHaveRoom } from './doesLocalStorageHaveRoom'
import { makeRoomInLocalStorage } from './makeRoomInLocalStorage'
import { areUrlsIdenticalBeforeHash } from './areUrlsIdenticalBeforeHash'
import { Cache } from './Cache'

export class Loda {
	cache = new Cache()
	// Is true if the hash is currently being changed

	ignoreNav = false

	// Is true if the load binder is trying to run
	binderTimeout?: number

	// Loaded first time
	loaded = false

	// Pages that already have the RML-generated list of pages to pageCache retrieved.
	loadedFor: string[] = []

	// Automatically set by retrieving value from the Loda script tag.
	// Required for RML, and requires Loda account.
	// Not required for any other features.
	lodaId?: string

	// Keeps track of what page was just navigated away from.
	lastPage?: string

	// Stores the page that will be shown after load if link is clicked.
	queuedUrl?: string

	// Override this to pass API calls through a custom proxy to protect your
	// API key and to allow you to filter requests to prevent DoS and other abuse
	mlEndpoint = 'https://api.loda.io'
	usingCustomMlEndpoint = false

	/**
	 * @function prepareForLoad
	 * @memberof Loda
	 * @description Runs on page load. Prepares for Loda initialization.
	 */
	prepareForLoad = () => {
		this.cache.loadingAnimation.nevermind()

		// Dispatch the page-loading event
		dispatchEventOnDocument('page-loading', {
			cache: this.cache.html
		})

		// Clear and renew the Loda initialization delay
		if (this.binderTimeout) clearTimeout(this.binderTimeout)

		this.binderTimeout = window.setTimeout(this.actualLoader, 10)
	}

	/**
	 * @function actualLoader
	 * @memberof Loda
	 * @description Initialize Loda.
	 */
	actualLoader = async () => {
		// If no body exists, retry initialization
		if (!document.body) {
			this.prepareForLoad()
			return
		}

		// Manually trigger load events
		if (this.loaded) {
			dispatchEventOnDocument('page-loaded')
			const loadEvent = new UIEvent('load')
			document.dispatchEvent(loadEvent)
			window.dispatchEvent(loadEvent)
		}

		// Remember this page for when the user navigates away
		this.lastPage = location.href

		// Find all the anchors on the page
		const anchors = document.querySelectorAll('a')

		// Get the current domain
		const srcDomain = location.hostname

		// Iterate over all anchors on the current page
		for (const anchor of anchors) {
			// Get the current anchor's href
			const { href } = anchor

			// If the anchor is actually a anchor and...
			//   doesn't have loda-disabled and...
			//   starts with a valid protocol and...
			//   doesn't have a target set and...
			//   I'm not sure what this next bit does and...
			//   the target domain is the current domain
			if (
				href &&
				!isAnchorLodaBound(anchor) &&
				!isAnchorLodaDisabled(anchor) &&
				doesUrlMatchProtocol(href, 'https?') &&
				!doesUrlHaveTarget(anchor) &&
				doProtocolsMatch(href, location.href) &&
				isAnchorOfDomain(href, srcDomain)
			) {
				// Ensure the target page is not the active page,
				//   i.e. anchors to the same page will just trigger reload per usual
				if (areUrlsIdenticalBeforeHash(location.href, href)) {
					// Just a hash change...probably
					bind(anchor, 'click', this.handleHashChange)
				} else {
					// Different page

					// Load the page from pageCache when the anchor is clicked down upon
					bind(
						anchor,
						'mousedown',
						this.clickLink as unknown as EventListener
					)

					// Mark this anchor as accelerated by Loda
					anchor.setAttribute('loda-bound', 'true')
				}
			}
		}

		// Find an element, probably the <script> reffing Loda, tagged as the Loda config
		const ts = grab('loda-script')

		// If the Loda element exists
		if (ts) {
			const id = ts.getAttribute('loda-id')
			if (id) this.lodaId = id

			// See if there's a proxy to use
			const customMlEndpoint = ts.getAttribute('ml-endpoint')
			this.mlEndpoint = customMlEndpoint ?? 'https://api.loda.io'
			this.usingCustomMlEndpoint = Boolean(customMlEndpoint)
		}

		// If Loda's ID or a proxy has been set, poll the server or proxy for RML data
		if (
			(typeof this.lodaId === 'string' || this.usingCustomMlEndpoint) &&
			!this.loadedFor.includes(location.href)
		) {
			void this.pollServer(location.href)
			this.loadedFor.push(location.href)
		}

		// Dispatch page-prepped event
		dispatchEventOnDocument('page-prepped')

		// Page is loaded
		this.loaded = true
	}

	/**
	 * @function clickLink
	 * @memberof Loda
	 * @description Called when a user clicked on a Loda-enabled anchor.
	 * @param {MouseEvent|string} event - click event or URL to explicitly follow
	 */
	clickLink = async (event: string | MouseEvent) => {
		// This will contain the URL to load
		let element

		// If event is a URL, we're good
		if (typeof event === `string`) element = event
		// If event is a click event, get the URL from it
		else {
			// Get the element clicked
			element = event.target as Element

			// If event is a click event with button > 1 (not left click)
			if (event.button) {
				// Don't interfere with the click
				return

				// If it's a left-click
			}

			if (event.button === 0) {
				// Cancel it
				event.preventDefault()
			}

			// Trigger a spooling animation if the page takes too long to load
			this.cache.loadingAnimation.triggerWhenNecessary()

			// Climb ancestors until an anchor is found
			//    Useful when a span is clicked inside a Loda-boosted anchor
			while (element && !(element instanceof HTMLAnchorElement))
				element = element.parentNode
			if (!element) return
			// Get the URL to load
			element = element.href
		}

		// D now contains a URL one way or antoher

		// Store the last page in a temp variable
		const lastPage = this.lastPage

		// Gotta multitask now
		const promises: Array<Promise<void>> = []

		// Load the new page
		promises.push(this.loadPage(element))

		// Poll the server for new RML/DML data
		// Note: might need to play with the variable a bit to fix a bug
		if (typeof this.lodaId === 'string')
			promises.push(this.pollServer(element, lastPage))

		// Run the async code and return
		await Promise.all(promises)
	}

	/**
	 * @function loadPage
	 * @memberof Loda
	 * @description Retrieves a page for preloading.
	 * @param {string} page - the page to load
	 * @param {boolean} pop - whether to show the page
	 */
	loadPage = async (page: string, pop?: boolean) => {
		// Set the last page variable to the current page
		this.lastPage = page

		// If the current page is cached
		if (this.cache.html.has(page)) {
			// Display the page
			await nothing(0)
			await this.showPage(page, pop)
		}
		// Otherwise, pageCache the page and try again
		else await this.cachePage(page, true, pop)
	}

	/**
	 * @function cachePage
	 * @memberof Loda
	 * @description Cache a page if it is not already cached or being cached.
	 * @param {string} url - the page to load
	 * @param {boolean} show - whether to show the page
	 * @param {boolean} pop - whether to pop states
	 */
	cachePage = async (url: string, show?: boolean, pop?: boolean) => {
		// If we're going to show the page, queue it and alert the masses
		if (show) {
			this.queuedUrl = url
			dispatchEventOnDocument('page-queued', {
				page: url
				/* Will eventually include the link that was clicked */
			})
		}

		// If the page is already being cached in memory, don't do anything
		if (this.cache.started.has(url)) return

		// Mark the page as being cached
		this.cache.started.add(url)

		// Get the stored copy of the requested page
		const storedPage = this.storedPageFor(url)

		// Some permacaching magic
		if (
			this.getSiteVersion() !== -1 &&
			storedPage &&
			storedPage.version >= this.getSiteVersion()
		) {
			// Copy the CachedPage from localStorage into memory and alert the masses
			this.cache.html.set(url, storedPage.content)
			dispatchEventOnDocument('permacache-hit', {
				page: url
			})

			// Show the permacached page
			if (this.queuedUrl) void this.showPage(url, pop)
		} else {
			// Page not in permacache, need to fetch it from the web server

			const response = await fetch(url)

			const html = await response.text()

			// Page gotten. Alert the masses
			this.cache.html.set(url, html)
			dispatchEventOnDocument('page-cached', {
				page: url,
				content: html
			})

			// Delete old pageCache items until there's enough room for the new page
			makeRoomInLocalStorage(html.length)

			// If permacaching is enabled, store the page in localStorage
			if (
				this.getSiteVersion() > -1 &&
				doesLocalStorageHaveRoom(html.length)
			) {
				localStorage.setItem(
					url,
					JSON.stringify({
						content: html,
						version: this.getSiteVersion(),
						date: Date.now(),
						last_used: Date.now(),
						owner: 'Loda'
					})
				)

				// Alert the masses! Page has been cached!
				dispatchEventOnDocument('page-permacached')
			}

			// Show the page already
			if (this.queuedUrl) void this.showPage(this.queuedUrl, pop)
		}
	}

	/**
	 * @function showPage
	 * @memberof Loda
	 * @description Display a cached page.
	 * @param {string} page - the page to show
	 * @param {boolean} pop - whether to pop states
	 */
	showPage = async (page: string, pop = false) => {
		// HTML to display
		let html

		// If the page exists, display it
		if (page) {
			// Set the HTML to the cached copy of the page
			html = this.cache.html.get(page)
			if (!html) return

			// Display the new page
			writeHtmlToDocument(html)

			// Pop state if necessary
			if (!pop)
				history.pushState(
					{
						page
					},
					'',
					page
				)
			await nothing(0)
			// Trigger the loader function once page is written to DOM
			this.prepareForLoad()
		}
		// If page is not cached, pageCache it
		else void this.cachePage('index.html', true, true)
	}

	/**
	 * @function popPage
	 * @memberof Loda
	 * @description Reload the page to clear the pageCache if the user clicks back or next.
	 * // WARNING: contains faulty code. Repair or purge.
	 * @param {} o - unused. Purge.
	 */
	popPage = (o: { state: unknown }) => {
		// Location.reload();
		// alert();
		// alert(JSON.stringify(o.state))
		if (o.state === null /* changingHash */ && this.ignoreNav) {
			this.ignoreNav = false
			// Alert();
		} else {
			location.reload()
		}
	}

	/**
	 * @function getSiteVersion
	 * @memberof Loda
	 * @description Get the site version for permacaching purposes.
	 */
	getSiteVersion = (): number => {
		const versionString = grab('loda-script')?.getAttribute('site-version')
		return Number(versionString) || -1
	}

	/**
	 * @function storedPageFor
	 * @memberof Loda
	 * @description Get a permacached page from localStorage.
	 * @param {string} page - the page to grab from localStorage
	 */
	storedPageFor = (page: string) => {
		const data = localStorage.getItem(page)
		return data ? (JSON.parse(data) as CachedPage) : 0
	}

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
	pollServer = async (page: string, lastPage?: string) => {
		// Data to send to server in POST body
		// action: the thing you want the API to do
		// current_page: whatever page you want the RML or DML data for
		// api_key: the Loda ID grabbed from the loda-script object
		//    by sending the request to a proxy, you can have the proxy
		//    append the Loda ID once the request is verified by your system
		const data: {
			action: string
			current_page: string
			api_key?: string
			last_page?: string
		} = {
			action: 'loading_page',
			current_page: formatUrl(page),
			api_key: this.lodaId
		}

		// If you want to grab the RML data for a page you're not currently on
		if (lastPage) data.last_page = formatUrl(lastPage)

		const fetched = await fetch(this.mlEndpoint, {
			body: JSON.stringify(data),
			method: 'POST'
		})

		// Get the pages the RML or DML recommends cachingPages, currently the top five
		const { err, pages } = (await fetched.json()) as {
			pages: string[]
			err?: unknown
		}

		if (pages) {
			// Cache all of them
			for (const url of pages) {
				// Fire and forget
				void this.cachePage(url)
			}
		} else {
			// Uh oh! There's an error. Let's tell everyone!
			dispatchEventOnDocument('api-error', {
				error: err
			})
		}
	}

	init = () => {
		// Listen for back and forward button clicks
		try {
			window.removeEventListener('popstate', this.popPage)
		} catch {
			console.log('popstate rebound')
		}

		window.addEventListener('popstate', this.popPage)
		// Alert('popPage bound')

		// Trigger the loader on page load
		runWhenDomReady(this.prepareForLoad)
	}

	private handleHashChange() {
		this.ignoreNav = true
	}
}
