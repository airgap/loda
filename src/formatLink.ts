export const formatLink = (link: string) => {
	const a = document.createElement('a')
	a.href = link
	return a.href
}
