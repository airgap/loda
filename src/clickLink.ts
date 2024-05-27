import { state } from './state'
import { pollServer } from './pollServer'
import { makeDeferredPageLoadSpooler } from './makeDeferredPageLoadSpooler'
import { loadPage } from './loadPage'

/**
 * @function clickLink
 * @memberof Loda
 * @description Called when a user clicked on a Loda-enabled anchor.
 * @param {MouseEvent|string} e - click event or URL to explicitly follow
 */
export const clickLink = (e: string | MouseEvent) => {
	// This will contain the URL to load
	let href: string | undefined

	// If e is a URL, we're good
	if (typeof e === `string`) href = e
	// If e is a click event, get the URL from it
	else {
		// Get the element clicked
		let element = e.target

		// If e is a click event with button > 1 (not left click)
		if (e.button) {
			// Don't interfere with the click
			return

			// If it's a left-click
		}

		if (e.button === 0) {
			// Cancel it
			e.preventDefault()
		}

		// Trigger a spooling animation if the page takes too long to load
		makeDeferredPageLoadSpooler()

		// Climb ancestors until an anchor is found
		//    Useful when a span is clicked inside a Loda-boosted anchor
		while (
			element &&
			element instanceof Element &&
			!(element instanceof HTMLAnchorElement)
		)
			element = element.parentNode

		// Get the URL to load
		if (element instanceof HTMLAnchorElement) href = element.href
	}

	// D now contains a URL one way or antoher
	if (!href) throw new Error('Oops')
	// Store the last page in a temp variable
	const last_page = state.LAST_PAGE

	// Load the new page
	loadPage(href)

	// Poll the server for new RML/DML data
	// Note: might need to play with the variable a bit to fix a bug
	if (typeof state.LODA_ID === 'string') pollServer(href, last_page)
}
