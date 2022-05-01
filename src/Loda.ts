// Helper functions. Soon to be replaced.

import { grab } from './grab'

import { dispatchEventOnDocument } from './dispatchEventOnDocument'
import { runWhenDomReady } from './runWhenDomReady'
import { getHashPos } from './getHashPos'
import { formatLink } from './formatLink'
import { CachedPage } from './CachedPage'

export class Cache {
	// Cache of downloaded pages.
	html = new Map<string, string>()

	// Pages that are currently being cached.
	started = new Set<string>()

	loadingAnimation = new LoadingAnimation()
}

export class LoadingAnimation {
	// The timer that says when to kick in
	kickinTimer?: number

	/**
	 * @function makeDeferredPageLoadSpooler
	 * @memberof Loda
	 * @description Show a page spooling animation if a load is taking too long.
	 * Currently non-functional
	 */
	triggerWhenNecessary = () => {
		if (!this.kickinTimer) {
			this.kickinTimer = window.setTimeout(() => {
				const b = document.body
				b.style.cursor = 'none'
				b.style.pointerEvents = 'none'
				b.style.opacity = '.5'
			}, 500)
		}
	}
	nevermind = () => {
		// Prevent any spooling animations from displaying
		if (this.kickinTimer) {
			clearTimeout(this.kickinTimer)
			this.kickinTimer = undefined
		}
	}
}

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
	LAST_PAGE?: string

	// Stores the page that will be shown after load if link is clicked.
	queuedPage?: string

	// Override this to pass API calls through a custom proxy to protect your
	// API key and to allow you to filter requests to prevent DoS and other abuse
	mlEndpoint = 'https://api.loda.io'
	usingCustomMlEndpoint = false

	/**
	 * @function loader
	 * @memberof Loda
	 * @description Runs on page load. Prepares for Loda initialization.
	 */
	loader = () => {
		this.cache.loadingAnimation.nevermind()

		// Dispatch the page-loading event
		dispatchEventOnDocument('page-loading', {
			cache: this.cache.html
		})

		// Clear and renew the Loda initialization delay
		if (this.binderTimeout) {
			clearTimeout(this.binderTimeout)
		}

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
			this.loader()
			return
		}

		// Manually trigger load events
		if (this.loaded) {
			dispatchEventOnDocument('page-loaded')
			for (const d of [document, window]) {
				d.dispatchEvent(new UIEvent('load'))
			}
		}

		// Remember this page for when the user navigates away
		this.LAST_PAGE = location.href

		// Find all the anchors on the page
		const links = document.querySelectorAll('a')

		// Get the current domain
		const srcDomain = location.hostname

		const srcHashPos = getHashPos()

		// Iterate over all links on the current page
		for (const link of links) {
			// Get the current link's href
			const { href } = link

			// Get its hash's location in the URL
			let destHashPos = href.indexOf('#')

			// If no hash exists, pretend there's one at the end
			if (destHashPos === -1) destHashPos = href.length

			// If the link is actually a link and...
			//   doesn't have loda-disabled and...
			//   starts with a valid protocol and...
			//   doesn't have a target set and...
			//   I'm not sure what this next bit does and...
			//   the target domain is the current domain
			if (
				href &&
				!link.getAttribute('loda-bound') &&
				!link.getAttribute('loda-disabled') &&
				/^https?:\/\//.test(href) &&
				!link.getAttribute('target') &&
				/^(.+?):\/\//.exec(location.href)?.[1] ===
					/^(.+?):\/\//.exec(href)?.[1] &&
				new RegExp('^https?://' + srcDomain + '([:/#]|$)').test(href)
			) {
				// Ensure the target page is not the active page,
				//   i.e. links to the same page will just trigger reload per usual
				if (
					location.href.endsWith(
						href.slice(0, Math.max(0, destHashPos)),
						srcHashPos
					)
				) {
					// Just a hash change...probably
					link.addEventListener('click', this.handleHashChange)
				} else {
					// Different page

					// Load the page from pageCache when the link is clicked down upon
					link.addEventListener('mousedown', this.clickLink)

					// Mark this link as accelerated by Loda
					link.setAttribute('loda-bound', 'true')
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
		const last_page = this.LAST_PAGE

		// Load the new page
		this.loadPage(element)

		// Poll the server for new RML/DML data
		// Note: might need to play with the variable a bit to fix a bug
		if (typeof this.lodaId === 'string')
			await this.pollServer(element, last_page)
	}

	/**
	 * @function loadPage
	 * @memberof Loda
	 * @description Retrieves a page for preloading.
	 * @param {string} page - the page to load
	 * @param {boolean} pop - whether to show the page
	 */
	loadPage = (page: string, pop?: boolean) => {
		// Set the last page variable to the current page
		this.LAST_PAGE = page

		// If the current page is cached
		if (this.cache.html.has(page))
			// Display the page
			setTimeout(() => {
				this.showPage(page, pop)
			}, 0)
		// Otherwise, pageCache the page and try again
		else void this.cachePage(page, true, pop)
	}

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
			this.queuedPage = page
			dispatchEventOnDocument('page-queued', {
				page
				/* Will eventually include the link that was clicked */
			})
		}

		// If the page is already being cached, don't do anything
		if (this.cache.started.has(page)) return

		// Mark the page as being cached
		this.cache.started.add(page)

		// Get the stored copy of the requested page
		const sp = this.storedPageFor(page)

		// Some permacaching magic
		if (
			this.getSiteVersion() > -1 &&
			sp &&
			sp.version >= this.getSiteVersion()
		) {
			// Load the page from permacache (localStorage) and alert the masses
			this.cache.html.set(page, sp.content)
			dispatchEventOnDocument('permacache-hit', {
				page
			})

			// Show the permacached page
			if (this.queuedPage) this.showPage(page, pop)
		} else {
			// Page not in permacache, need to fetch it from the web server

			const response = await fetch(page)

			const html = await response.text()

			// Page gotten. Alert the masses
			this.cache.html.set(page, html)
			dispatchEventOnDocument('page-cached', {
				page,
				content: html
			})

			// Delete old pageCache items until there's enough room for the new page
			this.cleanCache(html.length)

			// If permacaching is enabled, store the page in localStorage
			if (
				this.getSiteVersion() > -1 &&
				this.getCacheSize() + html.length < 4_000_000
			) {
				localStorage.setItem(
					page,
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
			if (this.queuedPage) this.showPage(this.queuedPage, pop)
		}
	}

	/**
	 * @function showPage
	 * @memberof Loda
	 * @description Display a cached page.
	 * @param {string} page - the page to show
	 * @param {boolean} pop - whether to pop states
	 */
	showPage = (page: string, pop = false) => {
		// HTML to display
		let html

		// If the page exists, display it
		if (page) {
			// Set the HTML to the cached copy of the page
			html = this.cache.html.get(page)
			if (!html) return

			// Display the new page
			window.document.open()
			window.document.write(html)
			window.document.close()
			console.log('OPENED WROTE CLOSED', html)

			// Pop state if necessary
			if (!pop)
				history.pushState(
					{
						page
					},
					'',
					page
				)
			// Trigger the loader function once page is written to DOM
			setTimeout(() => {
				this.loader()
			}, 0)
		} else {
			// If page is not cached, pageCache it
			void this.cachePage('index.html', true, true)
		}
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
	getSiteVersion = () => {
		const ts = grab('loda-script')
		return ts ? ts.getAttribute('site-version') ?? -1 : -1
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
	 * @function cacheSize
	 * @memberof Loda
	 * @description Get the amount of data stored in localStorage.
	 */
	getCacheSize = () => {
		let cacheSize = 0
		for (let i = 0, length = localStorage.length; i < length; ++i) {
			const k = localStorage.key(i)
			if (!k) continue
			const v = localStorage.getItem(k)
			if (!v) continue
			let data
			try {
				data = JSON.parse(v) as CachedPage
			} catch {
				continue
			}

			if (data.owner === 'Loda') {
				cacheSize += data.content.length
			}
		}

		return cacheSize
	}

	/**
	 * @function cleanCache
	 * @memberof Loda
	 * @description Delete pageCache items until a certain amount of free space is left.
	 * @param {number} extra - the amount of space needed in pageCache
	 */
	cleanCache = (extra: number) => {
		let cacheSize = this.getCacheSize()
		while (cacheSize + extra > 4_000_000 && cacheSize > 0) {
			cacheSize = 0
			let earliestDate = Date.now()
			let earliestId
			for (let i = 0, length = localStorage.length; i < length; ++i) {
				const k = localStorage.key(i)
				if (!k) continue
				const v = localStorage.getItem(k)
				if (!v) continue
				let data
				try {
					data = JSON.parse(v) as CachedPage
				} catch {
					continue
				}

				if (data.owner === 'Loda') {
					cacheSize += data.content.length
					if (data.last_used < earliestDate) {
						earliestDate = data.last_used
						earliestId = k
					}
				}
			}

			if (earliestId) {
				localStorage.removeItem(earliestId)
				dispatchEventOnDocument('pageCache-trimmed', {
					page: earliestId
				})
			}
		}

		// Alert the masses, the pageCache has been cleaned
		dispatchEventOnDocument('pageCache-cleaned')
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
			current_page: formatLink(page),
			api_key: this.lodaId
		}

		// If you want to grab the RML data for a page you're not currently on
		if (lastPage) data.last_page = formatLink(lastPage)

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
		runWhenDomReady(this.loader)
	}

	private handleHashChange() {
		this.ignoreNav = true
	}
}
