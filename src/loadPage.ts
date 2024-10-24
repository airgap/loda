import { state } from './state'
import { showPage } from './showPage'
import { cachePage } from './cachePage'

/**
 * @function loadPage
 * @memberof Loda
 * @description Retreives a page for preloading.
 * @param {string} page - the page to load
 * @param {boolean} pop - whether to show the page
 */
export const loadPage = (page: string, pop?: boolean) => {
	// Set the last page variable to the current page
	state.lastPage = page

	// If the current page is cached
	if (state.pageCache[page])
		// Display the page
		requestAnimationFrame(() => {
			showPage(page, pop)
		})
	// Otherwise, pageCache the page and try again
	else cachePage(page, true, pop)
}
