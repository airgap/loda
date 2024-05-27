import { state } from './state'
import { actualLoader } from './actualLoader'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

/**
 * @function loader
 * @memberof Loda
 * @description Runs on page load. Prepares for Loda initialization.
 */
export const loader = () => {
	// Prevent any spooling animations from displaying
	if (state.deferredPageLoadSpooler) {
		clearTimeout(state.deferredPageLoadSpooler)
		state.deferredPageLoadSpooler = undefined
	}

	// Dispatch the page-loading event
	dispatchEventOnDocument('page-loading', {
		cache: state.pageCache
	})

	// Clear and renew the Loda initialization delay
	if (state.binderTimeout) {
		clearTimeout(state.binderTimeout)
	}

	state.binderTimeout = setTimeout(actualLoader, 10)
}
