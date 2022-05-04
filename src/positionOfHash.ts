export const positionOfHash = (url: string = location.href) => {
	// Get the hash position in the current URL
	const srcHashPos = url.indexOf('#')

	// If there is no hash, pretend there's one at the end
	return srcHashPos > -1 ? srcHashPos : location.href.length
}
