import { state } from './state'

/**
 * @function popPage
 * @memberof Loda
 * @description Reload the page to clear the pageCache if the user clicks back or next.
 */
export const popPage = () => {
	if (state.changingHash) state.changingHash = false
	else location.reload()
}
