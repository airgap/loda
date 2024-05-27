/**
 * @function grab
 * @memberof Loda
 * @description Get an element or elements by their IDs.
 * @param {Element} elem - string containing id or pipe-separated id list
 * @returns Element or array of Elements
 */
export const grab = (element: string | Element) =>
	typeof element === 'string' ? document.getElementById(element) : element

/**
 * @function bind
 * @memberof Loda
 * @description Bind a function to an event.
 * @param {} emitter - the emitting object to bind to
 * @param {string} trigger - the event to listen to
 * @param {function} func - the function to trigger
 */
export const bind = (emitter: any, trigger: string, function_: Function) =>
	emitter.addEventListener(
		trigger,
		function_ as unknown as EventListenerObject
	)

/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
export const load = (function_: Function) =>
	bind(window, 'DOMContentLoaded', function_)
