export const formatUrl = (link: string) => {
	const a = document.createElement('a')
	a.href = link
	return a.href
}
