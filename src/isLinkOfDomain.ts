export const isLinkOfDomain = (url: string, domain: string) =>
	new RegExp(`^https?://${domain}([:/#]|$)`).test(url)
