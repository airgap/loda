import bind from "./bind";

/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
export default (func: Function) => bind(window, "DOMContentLoaded", func);