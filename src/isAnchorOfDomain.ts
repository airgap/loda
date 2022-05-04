export const isAnchorOfDomain = (url: string, domain: string) =>
	new RegExp(`^https?://${domain}([:/#]|$)`).test(url)
