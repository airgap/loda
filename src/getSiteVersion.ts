import { grab } from './utils'

/**
 * @function getSiteVersion
 * @memberof Loda
 * @description Get the site version for permacaching purposes.
 */
export const getSiteVersion = () => {
	const ts = grab('loda-script')
	return Number(ts ? ts.getAttribute('site-version') ?? -1 : -1)
}
