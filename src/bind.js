/**
 * @function bind
 * @memberof Loda
 * @description Bind a function to an event.
 * @param {} emitter - the emitting object to bind to
 * @param {string} trigger - the event to listen to
 * @param {function} func - the function to trigger
 */
export const bind = (emitter, trigger, func) => {
    emitter.addEventListener(trigger, func);
};
