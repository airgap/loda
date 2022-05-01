export const formatLink = (link) => {
    const a = document.createElement('a');
    a.href = link;
    return a.href;
};
