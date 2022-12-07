import fetch from 'node-fetch';
import { addic7edURL, headers } from './helpers.mjs';

const regexp = /<option value="\d+" >([^<]*)<\/option>/gm;

export default async function getShowTitles() {

    const response = await fetch(addic7edURL, {headers});
    const body = await response.text();

    // Find all show titles
    // --------------------
    const showTitles = [];
    let match;
    while ((match = regexp.exec(body)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regexp.lastIndex) {
            regexp.lastIndex++;
        }
        showTitles.push(match[1].replace('&amp;', '&'));
    }

    return showTitles;
}
