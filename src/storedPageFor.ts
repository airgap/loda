import { type PageInfo } from './PageInfo'

/**
 * @function storedPageFor
 * @memberof Loda
 * @description Get a permacached page from localStorage.
 * @param {string} page - the page to grab from localStorage
 */
export const storedPageFor = (page: string): PageInfo | undefined => {
	const data = localStorage.getItem(page)
	return data ? (JSON.parse(data) as PageInfo) : undefined
}
