import { state } from './state'
import { storedPageFor } from './storedPageFor'
import { getSiteVersion } from './getSiteVersion'
import { showPage } from './showPage'
import { getCacheSize } from './getCacheSize'
import { cleanCache } from './cleanCache'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'
import { type PageInfo } from './PageInfo'

/**
 * @function cachePage
 * @memberof Loda
 * @description Cache a page if it is not already cached or being cached.
 * @param {string} page - the page to load
 * @param {boolean} show - whether to show the page
 * @param {boolean} pop - whether to pop states
 */
export const cachePage = (page: string, show?: boolean, pop?: boolean) => {
	// If we're going to show the page, queue it and alert the masses
	if (show) {
		state.queuedPage = page
		dispatchEventOnDocument('page-queued', {
			page
			/* Will eventually include the link that was clicked */
		})
	}

	// If the page is already being cached, don't do anything
	if (state.cachingPages[page]) return

	// Now cachingPages the page
	state.cachingPages[page] = true

	// Get the stored copy of the requested page
	const sp = storedPageFor(page)

	// Some permacaching magic
	if (getSiteVersion() > -1 && sp && sp.version >= getSiteVersion()) {
		// Load the page from permacache (localStorage) and alert the masses
		state.pageCache[page] = sp.content
		dispatchEventOnDocument('permacache-hit', {
			page
		})

		// Show the permacached page
		if (state.queuedPage) showPage(page, pop)
	} else {
		// Page not in permacache, need to fetch it from the web server

		// Prep request
		const x = new XMLHttpRequest()
		x.addEventListener('load', () => {
			// Page gotten. Alert the masses
			state.pageCache[page] = x.response
			dispatchEventOnDocument('page-cached', {
				page,
				content: x.response
			})

			// Delete old pageCache items until there's enough room for the new page
			cleanCache(x.response.length)

			// If permacaching is enabled, store the page in localStorage
			if (
				getSiteVersion() > -1 &&
				getCacheSize() + x.response.length < 4_000_000
			) {
				localStorage.setItem(
					page,
					JSON.stringify({
						content: x.response,
						version: getSiteVersion(),
						date: Date.now(),
						last_used: Date.now(),
						owner: 'Loda'
					} as PageInfo)
				)

				// Alert the masses! Page has been cached!
				dispatchEventOnDocument('page-permacached')
			}

			// Show the page already
			if (state.queuedPage) showPage(state.queuedPage, pop)
		})

		// Send the request for the page to the web server
		x.open('GET', page)
		x.send()
	}
}
