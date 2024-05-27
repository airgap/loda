/**
 * @function cacheSize
 * @memberof Loda
 * @description Get the amount of data stored in localStorage.
 */
export const getCacheSize = () => {
	let cacheSize = 0
	for (let i = 0, len = localStorage.length; i < len; ++i) {
		let k = localStorage.key(i)
		if (!k) continue
		let v = localStorage.getItem(k)
		if (!v) continue
		let data
		try {
			data = JSON.parse(v)
		} catch (ex) {
			continue
		}
		if (data.owner == 'Loda') {
			cacheSize += data.content.length
		}
	}
	return cacheSize
}
