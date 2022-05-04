export const doesUrlHaveTarget = (link: HTMLAnchorElement): boolean =>
	Boolean(link.getAttribute('target'))
