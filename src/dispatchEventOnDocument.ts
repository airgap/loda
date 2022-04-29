/**
 * Dispatch a custom event on the document object
 * @param {text} event - event type
 * @param {object} detail - event detail
 */

export default (event: string, detail?: any) => {
    document.dispatchEvent(new CustomEvent(event, {
        'detail': detail
    }))
};