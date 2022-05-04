export const isAnchorLodaDisabled = (link: HTMLAnchorElement): boolean =>
	Boolean(link.getAttribute('loda-disabled'))
