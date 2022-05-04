export const doesUrlHaveTarget = (link: HTMLAnchorElement): boolean =>
	!!link.getAttribute('target')
