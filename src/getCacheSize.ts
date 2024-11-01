import type { PageInfo } from './types'

/**
 * @function cacheSize
 * @memberof Loda
 * @description Get the amount of data stored in localStorage.
 */
export const getCacheSize = (): number => {
	let cacheSize = 0
	for (let i = 0, length = localStorage.length; i < length; ++i) {
		const key = localStorage.key(i)
		if (!key) continue
		const value = localStorage.getItem(key)
		if (!value) continue
		let pageInfo: PageInfo
		try {
			pageInfo = JSON.parse(value) as PageInfo
		} catch {
			continue
		}

		if (pageInfo.owner === 'Loda') {
			cacheSize += pageInfo.content.length
		}
	}

	return cacheSize
}
