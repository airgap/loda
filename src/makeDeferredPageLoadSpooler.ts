import { state } from './state'

/**
 * @function makeDeferredPageLoadSpooler
 * @memberof Loda
 * @description Show a page spooling animation if a load is taking too long.
 * Currently non-functional
 */
export const makeDeferredPageLoadSpooler = () => {
	state.deferredPageLoadSpooler ??= setTimeout(() => {
		const b = document.body
		b.style.cursor = 'none'
		b.style.pointerEvents = 'none'
		b.style.opacity = '.5'
	}, 500)
}
