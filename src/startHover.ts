import { state } from './state'
import { cachePage } from './cachePage'

/**
 * @function startHover
 * @memberof Loda
 * @description Called when the movement prediction detects a hover.
 * If the hovered element (or ancestor) has an href, preload it.
 */
export const startHover = (event: { target: Element }) => {
	// Get the hovered element
	let element: ParentNode | undefined = event.target

	// Climb ancestors until you see one with an href
	while (
		element instanceof Element &&
		!(element instanceof HTMLAnchorElement)
	)
		element = element.parentNode
	if (!(element instanceof HTMLAnchorElement))
		throw new Error('Cannot find anchor')
	// If the element exists and we can get an attribute from it
	// Note: getAttribute is leftover from an older Loda version. Purge.
	// Get the anchor's href
	const href = element.href

	// Clear any pageCache timers
	if (state.cacheTimer) {
		clearTimeout(state.cacheTimer)
	}

	// Cache the page on a slight delay
	// Set the delay to higher to reduce unnecessary page caches
	state.cacheTimer = setTimeout(() => {
		cachePage(href)
	}, 0)
}
