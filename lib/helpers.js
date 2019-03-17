function formatShowNumber (number) {
    number = parseInt(number);
    return number < 10 ? '0' + number : number;
}

module.exports = {
    addic7edURL:      'https://www.addic7ed.com',
    formatShowNumber: formatShowNumber
};
