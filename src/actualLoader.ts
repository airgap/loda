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

	const {
		href: currentHref,
		protocol: currentProtocol,
		hostname: currentHostname
	} = location

	// Remember this page for when the user navigates away
	state.lastPage = location.href

	// Find all the anchors on the page
	const links = document.getElementsByTagName('a')

	// Get the current domain
	const sourceDomain = currentHostname

	// Get the hash position in the current URL
	let sourceHashPos = currentHref.indexOf('#')

	// If there is no hash, pretend there's one at the end
	if (sourceHashPos === -1) sourceHashPos = currentHref.length

	// Iterate over all links on the current page
	for (const link of links) {
		// Get the current link's href
		const { href } = link

		// Get its hash's location in the URL
		let destinationHashPos = href.indexOf('#')

		// If no hash exists, pretend there's one at the end
		if (destinationHashPos === -1) destinationHashPos = href.length

		const url = new URL(href)
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
			currentProtocol === url.protocol &&
			url.hostname === sourceDomain
		) {
			// Ensure the target page is not the active page,
			//   i.e. links to the same page will just trigger reload per usual
			if (
				href.slice(0, Math.max(0, destinationHashPos)) ===
				currentHref.slice(0, Math.max(0, sourceHashPos))
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
	const script = grab('loda-script')

	// If the Loda element exists
	if (script) {
		// Get the Loda ID stored in the element
		state.lodaId = script.getAttribute('loda-id') ?? undefined

		// See if there's a proxy to use
		const server = script.getAttribute('ml-endpoint')
		state.mlEndpoint = server ?? 'https://api.loda.rocks'
	}

	// If Loda's ID or a proxy has been set, poll the server or proxy for RML data
	if (
		(typeof state.lodaId === 'string' || state.mlEndpoint) &&
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
