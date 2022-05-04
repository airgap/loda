export const writeHtmlToDocument = (html: string) => {
	window.document.open()
	window.document.write(html)
	window.document.close()
	console.log('OPENED WROTE CLOSED', html)
}
