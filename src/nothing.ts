export const nothing = async (ms: number) =>
	new Promise((r) => {
		window.setTimeout(r, ms)
	})
