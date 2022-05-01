export const grab = (element: string | Element) =>
	typeof element === 'string' ? document.getElementById(element) : element
