import { state } from './state'
import { cachePage } from './cachePage'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

/**
 * @function pollServer
 * @memberof Loda
 * @description Retrieve RML data from server. Only called if Loda ID or proxy is provided.
 * If a proxy is set, Loda will poll the proxy instead of the server directly for RML data.
 * This allows webmasters to store the Loda ID in the proxy instead of the client and
 * to filter out spoofed requests to pages that don't exist.
 * @param {string} e - page to get RML data for
 * @param {string} f - URL of page to grab RML data for, leave null for current page
 */
export const pollServer = (e: string, f?: string) => {
	if (!state.SERVER) throw new Error('No server set')
	// Prep server request
	const x = new XMLHttpRequest()
	x.addEventListener('load', () => {
		// Parse server response
		// Response will always be JSON, even in the case of errors
		const result: { err: any; pages: string[] } = JSON.parse(x.response)

		// Get the pages the RML or DML recommends cachingPages, currently the top five
		const urls = result.pages
		if (urls) {
			// Cache all of them
			for (const url of urls) {
				cachePage(url)
			}
		} else {
			// Uh oh! There's an error. Let's tell everyone!
			dispatchEventOnDocument('api-error', {
				error: result.err
			})
		}
	})

	// Force the required URL to be formatted properly
	const a = document.createElement('a')
	a.href = e

	// Data to send to server in POST body
	// action: the thing you want the API to do
	// current_page: whatever page you want the RML or DML data for
	// api_key: the Loda ID grabbed from the loda-script object
	//    by sending the request to a proxy, you can have the proxy
	//    append the Loda ID once the request is verified by your system
	type Data = {
		action: string
		current_page: string
		api_key?: string | undefined
		last_page?: string
	}
	const data: Data = {
		action: 'loading_page',
		current_page: a.href,
		api_key: state.LODA_ID
	}

	// If you want to grab the RML data for a page you're not currently on
	if (f) {
		a.href = f
		data.last_page = a.href
	}

	// Send the request
	x.open('POST', state.SERVER)
	x.send(JSON.stringify(data))
}
