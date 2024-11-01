/**
 * @function grab
 * @memberof Loda
 * @description Get an element or elements by their IDs.
 * @param {Element} element - string containing id or pipe-separated id list
 * @returns Element or array of Elements
 */
export const grab = (element: string | Element) =>
	typeof element === 'string' ? document.getElementById(element) : element
