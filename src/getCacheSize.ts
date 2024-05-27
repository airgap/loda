/**
 * @function cacheSize
 * @memberof Loda
 * @description Get the amount of data stored in localStorage.
 */
export const getCacheSize = () => {
	let cacheSize = 0
	for (let i = 0, length = localStorage.length; i < length; ++i) {
		const k = localStorage.key(i)
		if (!k) continue
		const v = localStorage.getItem(k)
		if (!v) continue
		let data
		try {
			data = JSON.parse(v)
		} catch {
			continue
		}

		if (data.owner === 'Loda') {
			cacheSize += data.content.length
		}
	}

	return cacheSize
}
