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
 * @param {string} currentPageUrl - URL of the current page for which RML data is being retrieved
 * @param {string} targetPageUrl - URL of a different page for which RML data is being requested, if applicable
 */
export const pollServer = async (
	currentPageUrl: string,
	targetPageUrl?: string
): Promise<void> => {
	if (!state.mlEndpoint) throw new Error('No server set')

	// Force the required URL to be formatted properly
	const a = document.createElement('a')
	a.href = currentPageUrl

	// Data to send to server in POST body
	const data: LoadingPageRequest = {
		action: 'loading_page',
		currentPage: a.href,
		apiKey: state.lodaId
	}

	// If you want to grab the RML data for a page you're not currently on
	if (targetPageUrl) {
		a.href = targetPageUrl
		data.lastPage = a.href
	}

	// Send the request using fetch
	await fetch(state.mlEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(async (response) => response.json())
		// Cache response pages
		.then(({ pages }: { pages: { urls: string[] } }) => {
			for (const page of pages.urls) void cachePage(page)
		})
}
