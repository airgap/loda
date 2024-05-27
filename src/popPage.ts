import { state } from './state'

/**
 * @function popPage
 * @memberof Loda
 * @description Reload the page to clear the pageCache if the user clicks back or next.
 */
export const popPage = () => {
	//location.reload();
	//alert();
	//alert(JSON.stringify(o.state))
	if (state.changingHash) {
		state.changingHash = false
		//alert();
	} else {
		location.reload()
	}
}
