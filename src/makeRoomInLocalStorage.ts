import { CachedPage } from './CachedPage'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'
import { getLocalStorageSize } from './getLocalStorageSize'

/**
 * @function cleanLocalStorage
 * @memberof Loda
 * @description Delete pageCache items until a certain amount of free space is left.
 * @param {number} spaceNeeded - the amount of space needed in pageCache
 */
export const makeRoomInLocalStorage = (spaceNeeded: number) => {
	let cacheSize = getLocalStorageSize()
	while (cacheSize + spaceNeeded > 4_000_000 && cacheSize > 0) {
		cacheSize = 0
		let earliestDate = Date.now()
		let earliestId
		for (let i = 0, length = localStorage.length; i < length; ++i) {
			const k = localStorage.key(i)
			if (!k) continue
			const v = localStorage.getItem(k)
			if (!v) continue
			let data
			try {
				data = JSON.parse(v) as CachedPage
			} catch {
				continue
			}

			if (data.owner === 'Loda') {
				cacheSize += data.content.length
				if (data.last_used < earliestDate) {
					earliestDate = data.last_used
					earliestId = k
				}
			}
		}

		if (earliestId) {
			localStorage.removeItem(earliestId)
			dispatchEventOnDocument('pageCache-trimmed', {
				page: earliestId
			})
		}
	}

	// Alert the masses, the pageCache has been cleaned
	dispatchEventOnDocument('pageCache-cleaned')
}
