import { grab } from './utils'

/**
 * @function getSiteVersion
 * @memberof Loda
 * @description Get the site version for permacaching purposes.
 */
export const getSiteVersion = () =>
	Number(grab('loda-script')?.getAttribute('site-version') ?? -1)
