/**
 * Dispatch a custom event on the document object
 * @param {text} event - event type
 * @param {object} detail - event detail
 */

export const dispatchEventOnDocument = (event: string, detail?: any) => {
	document.dispatchEvent(
		new CustomEvent(event, {
			detail,
		})
	);
};
