export const isAnchorLodaBound = (link: HTMLAnchorElement): boolean =>
	Boolean(link.getAttribute('loda-bound'))
