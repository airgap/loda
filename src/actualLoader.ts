import { state } from './state'
import { startHover } from './startHover'
import { grab } from './utils'
import { pollServer } from './pollServer'
import { clickLink } from './clickLink'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

/**
 * @function actualLoader
 * @memberof Loda
 * @description Initialize Loda.
 */
export const actualLoader = () => {
	// Manually trigger load events
	if (state.loaded) {
		dispatchEventOnDocument('page-loaded')
		for (const d of [document, window]) {
			d.dispatchEvent(new UIEvent('load'))
		}
	}

	// Remember this page for when the user navigates away
	state.LAST_PAGE = location.href

	// Find all the anchors on the page
	const links = document.getElementsByTagName('a')

	// Get the current domain
	const sourceDomain = location.hostname

	// Get the hash position in the current URL
	let sourceHashPos = location.href.indexOf('#')

	// If there is no hash, pretend there's one at the end
	if (sourceHashPos === -1) sourceHashPos = location.href.length

	// Iterate over all links on the current page
	for (const link of links) {
		// Get the current link's href
		const lh = link.href

		// Get its hash's location in the URL
		let destinationHashPos = lh.indexOf('#')

		// If no hash exists, pretend there's one at the end
		if (destinationHashPos === -1) destinationHashPos = lh.length

		// If the link is actually a link and...
		//   doesn't have loda-disabled and...
		//   starts with a valid protocol and...
		//   doesn't have a target set and...
		//   I'm not sure what this next bit does and...
		//   the target domain is the current domain
		if (
			link.href &&
			!link.getAttribute('loda-bound') &&
			!link.getAttribute('loda-disabled') &&
			/^https?:\/\//.test(link.href) &&
			!link.getAttribute('target') &&
			(/^(.+?):\/\//.exec(location.href) ?? [0])[1] ===
				(/^(.+?):\/\//.exec(lh) ?? [0])[1] &&
			new RegExp('^https?://' + sourceDomain + '([:/#]|$)').test(
				link.href
			)
		) {
			// Ensure the target page is not the active page,
			//   i.e. links to the same page will just trigger reload per usual
			if (
				lh.slice(0, Math.max(0, destinationHashPos)) ===
				location.href.slice(0, Math.max(0, sourceHashPos))
			) {
				// Just a hash change...probably
				link.addEventListener(
					'click',
					() => (state.changingHash = true)
				)
			} else {
				// Different page

				// Trigger Loda's cachingPages function on the link if FTL foresees a hover
				link.addEventListener('prehover', () => {
					startHover({
						target: link
					})
				})

				// Load the page from pageCache when the link is clicked down upon
				link.addEventListener('mousedown', clickLink)

				// Mark this link as accelerated by Loda
				link.setAttribute('loda-bound', 'true')
			}
		}
	}

	// Find an element, probably the <script> reffing Loda, tagged as the Loda config
	const ts = grab('loda-script')

	// Variable to store the site's Loda ID
	let ti

	// If the Loda element exists
	if (ts) {
		// Get the Loda ID stored in the element
		ti = ts.getAttribute('loda-id')
		state.LODA_ID = ti ?? undefined

		// See if there's a proxy to use
		const server = ts.getAttribute('loda-proxy')
		state.SERVER = server ?? 'https://api.loda.rocks'
		state.USING_PROXY = Boolean(server)
	}

	// If Loda's ID or a proxy has been set, poll the server or proxy for RML data
	if (
		(typeof state.LODA_ID === 'string' || state.USING_PROXY) &&
		!state.loadedFor.includes(location.href)
	) {
		pollServer(location.href)
		state.loadedFor.push(location.href)
	}

	// Dispatch page-prepped event
	dispatchEventOnDocument('page-prepped')

	// Page is loaded
	state.loaded = true
}
