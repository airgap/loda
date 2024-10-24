import { state } from './state'
import { pollServer } from './pollServer'
import { makeDeferredPageLoadSpooler } from './makeDeferredPageLoadSpooler'
import { loadPage } from './loadPage'

/**
 * @function clickLink
 * @memberof Loda
 * @description Called when a user clicked on a Loda-enabled anchor.
 * @param {MouseEvent|string} event - click event or URL to explicitly follow
 */
export const clickLink = (event: string | MouseEvent) => {
	// This will contain the URL to load
	let href: string | undefined

	// If e is a URL, we're good
	if (typeof event === `string`) href = event
	// If e is a click event, get the URL from it
	else {
		// Get the element clicked
		let element = event.target

		// Disregard clicks with button > 0 (not left click)
		if (event.button) return

		// Cancel left-click events
		if (event.button === 0) event.preventDefault()

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

	// Href now contains a URL one way or another
	if (!href) throw new Error('Oops')

	// Store the last page in a temp variable
	const lastPage = state.lastPage

	// Load the new page
	loadPage(href)

	// Poll the server for new RML/DML data
	// Note: might need to play with the variable a bit to fix a bug
	if (typeof state.lodaId === 'string') pollServer(href, lastPage)
}
