/**
 * @function grab
 * @memberof Loda
 * @description Get an element or elements by their IDs.
 * @param {Element} element - string containing id or pipe-separated id list
 * @returns Element or array of Elements
 */
export const grab = (element: string | Element) =>
	typeof element === 'string' ? document.getElementById(element) : element

/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
export const load = (function_: () => void) => {
	window.addEventListener('DOMContentLoaded', function_)
}
