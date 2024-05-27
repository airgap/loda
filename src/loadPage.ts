import { state } from './state'
import { showPage } from './showPage'
import { cachePage } from './cachePage'

/**
 * @function loadPage
 * @memberof Loda
 * @description Retreives a page for preloading.
 * @param {string} e - the page to load
 * @param {boolean} pop - whether to show the page
 */
export const loadPage = (e: string, pop?: boolean) => {
	// Set the last page variable to the current page
	state.LAST_PAGE = e

	// If the current page is cached
	if (state.pageCache[e])
		// Display the page
		setTimeout(() => {
			showPage(e, pop)
		}, 0)
	// Otherwise, pageCache the page and try again
	else cachePage(e, true, pop)
}
