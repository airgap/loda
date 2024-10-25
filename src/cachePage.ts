import { state } from './state'
import { storedPageFor } from './storedPageFor'
import { getSiteVersion } from './getSiteVersion'
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
export const cachePage = async (page: string) => {
	// If we're going to show the page, queue it and alert the masses

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
	} else {
		// Page not in permacache, need to fetch it from the web server
		const response = await fetch(page)
		const content = await response.text()

		// Page gotten. Alert the masses
		state.pageCache[page] = content
		dispatchEventOnDocument('page-cached', {
			page,
			content
		})

		// Delete old pageCache items until there's enough room for the new page
		cleanCache(content.length)

		// If permacaching is enabled, store the page in localStorage
		if (
			getSiteVersion() > -1 &&
			getCacheSize() + content.length < 4_000_000
		) {
			localStorage.setItem(
				page,
				JSON.stringify({
					content,
					version: getSiteVersion(),
					date: Date.now(),
					lastUsed: Date.now(),
					owner: 'Loda'
				} satisfies PageInfo)
			)

			// Alert the masses! Page has been cached!
			dispatchEventOnDocument('page-permacached')
		}
	}
}
