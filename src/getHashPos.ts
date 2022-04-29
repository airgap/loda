export default () => {
    // Get the hash position in the current URL
    let srcHashPos = location.href.indexOf("#");

    // If there is no hash, pretend there's one at the end
    return srcHashPos > -1 ? srcHashPos : location.href.length;
}
