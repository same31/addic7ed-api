function formatShowNumber (number) {
    return parseInt(number) < 10 ? '0' + number : number;
}

module.exports = {
    addic7edURL: 'http://www.addic7ed.com',
    formatShowNumber: formatShowNumber
};
