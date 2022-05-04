export const isAnchorLodaDisabled = (link: HTMLAnchorElement): boolean =>
	!!link.getAttribute('loda-disabled')
