/**
 * @function grab
 * @memberof Loda
 * @description Get an element or elements by their IDs.
 * @param {Element} elem - string containing id or pipe-separated id list
 * @returns Element or array of Elements
 */
export const grab = (elem: string | Element) =>
	typeof elem === 'string' ? document.getElementById(elem) : elem

/**
 * @function bind
 * @memberof Loda
 * @description Bind a function to an event.
 * @param {} emitter - the emitting object to bind to
 * @param {string} trigger - the event to listen to
 * @param {function} func - the function to trigger
 */
export const bind = (emitter: any, trigger: string, func: Function) =>
	emitter.addEventListener(trigger, <EventListenerObject>(<unknown>func))

/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
export const load = (func: Function) => bind(window, 'DOMContentLoaded', func)
