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
export const showPage = async (page: string, pop?: boolean) => {
	// HTML to display

	// If the page exists, display it
	if (!page) await cachePage('index.html')
	// Set the HTML to the cached copy of the page
	const html = state.pageCache[page]
	if (!html) return

	// Display the new page
	window.document.open()
	window.document.write(html)
	window.document.close()

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
}
