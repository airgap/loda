import { getCacheSize } from './getCacheSize'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'
import type { PageInfo } from './PageInfo'

/**
 * @function cleanCache
 * @memberof Loda
 * @description Delete pageCache items until a certain amount of free space is left.
 * @param {number} extra - the amount of space needed in pageCache
 */
export const cleanCache = (extraSpaceNeeded: number) => {
	let currentCacheSize = getCacheSize()
	while (
		currentCacheSize + extraSpaceNeeded > 4_000_000 &&
		currentCacheSize > 0
	) {
		currentCacheSize = 0
		let oldestPageDate = Date.now()
		let oldestPageId
		for (let i = 0; i < localStorage.length; ++i) {
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
				currentCacheSize += pageInfo.content.length
				if (pageInfo.lastUsed < oldestPageDate) {
					oldestPageDate = pageInfo.lastUsed
					oldestPageId = key
				}
			}
		}

		if (oldestPageId) {
			localStorage.removeItem(oldestPageId)
			dispatchEventOnDocument('pageCache-trimmed', {
				page: oldestPageId
			})
		}
	}

	// Alert the masses, the pageCache has been cleaned
	dispatchEventOnDocument('pageCache-cleaned')
}
