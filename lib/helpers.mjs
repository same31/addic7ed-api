export const addic7edURL = 'https://www.addic7ed.com';

export const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
};

export function formatShowNumber(number) {
    const i = parseInt(number, 10);
    return i < 10 ? '0' + number : number;
}
