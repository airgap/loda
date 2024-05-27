/**
 * @function storedPageFor
 * @memberof Loda
 * @description Get a permacached page from localStorage.
 * @param {string} page - the page to grab from localStorage
 */
export const storedPageFor = (page: string) => {
	const data = localStorage.getItem(page)
	return data ? JSON.parse(data) : 0
}
