import { getLinkProtocol } from './getLinkProtocol'

export const doProtocolsMatch = (
	...urls: [url1: string, url2: string, ...url3: string[]]
) => {
	// Get first protocol
	const protocol1 = getLinkProtocol(urls[0])

	// Enumerate over remaining urls
	// If any don't match, return false
	for (const url of urls.slice(1))
		if (getLinkProtocol(url) !== protocol1) return false

	// Else return true
	return true
}
