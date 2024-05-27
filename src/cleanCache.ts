import { getCacheSize } from './getCacheSize'
import { dispatchEventOnDocument } from './dispatchEventOnDocument'

/**
 * @function cleanCache
 * @memberof Loda
 * @description Delete pageCache items until a certain amount of free space is left.
 * @param {number} extra - the amount of space needed in pageCache
 */
export const cleanCache = (extra: number) => {
	let cacheSize = getCacheSize()
	while (cacheSize + extra > 4000000 && cacheSize > 0) {
		cacheSize = 0
		let earliestDate = +new Date()
		let earliestId
		for (let i = 0, len = localStorage.length; i < len; ++i) {
			const k = localStorage.key(i)
			if (!k) continue
			const v = localStorage.getItem(k)
			if (!v) continue
			let data
			try {
				data = JSON.parse(v)
			} catch (ex) {
				continue
			}
			if (data.owner == 'Loda') {
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
