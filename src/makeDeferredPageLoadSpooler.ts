import { state } from './state'

/**
 * @function makeDeferredPageLoadSpooler
 * @memberof Loda
 * @description Show a page spooling animation if a load is taking too long.
 * Currently non-functional
 */
export const makeDeferredPageLoadSpooler = () => {
	state.deferredPageLoadSpooler ??= setTimeout(() => {
		const { style } = document.body
		style.cursor = 'none'
		style.pointerEvents = 'none'
		style.opacity = '.5'
	}, 500)
}
