import { bind } from './bind';

/**
 * @function onload
 * @memberof Loda
 * @description Run a function on DOM load.
 * @param {function} func - function to run
 */
export const runWhenDomReady = (func: () => unknown) => {
	bind(window, 'DOMContentLoaded', func);
};
