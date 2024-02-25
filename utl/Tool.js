function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(sleep), ms));
}
module.exports = { sleep };
