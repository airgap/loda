import { state } from './state'
import { loader } from './loader'
import { cachePage } from './cachePage'

/**
 * @function showPage
 * @memberof Loda
 * @description Display a cached page.
 * @param {string} page - the page to show
 * @param {boolean} pop - whether to pop states
 */
export const showPage = (page: string, pop?: boolean) => {
	// HTML to display
	let html

	// If the page exists, display it
	if (page) {
		// Set the HTML to the cached copy of the page
		html = state.pageCache[page]
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
		requestAnimationFrame(loader)
	} else {
		// If page is not cached, pageCache it
		cachePage('index.html', true, true)
	}
}
