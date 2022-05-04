/**
 * @function bind
 * @memberof Loda
 * @description Bind a function to an event.
 * @param {EventTarget} emitter - the emitting object to bind to
 * @param {string} trigger - the event to listen to
 * @param {EventListenerOrEventListenerObject} func - the function to trigger
 * @param {AddEventListenerOptions} options - addEventListener options
 */
export const bind = (
	emitter: EventTarget,
	trigger: string,
	func: EventListenerOrEventListenerObject,
	options?: AddEventListenerOptions | boolean
) => {
	emitter.addEventListener(trigger, func, options)
}
