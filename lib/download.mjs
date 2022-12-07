import { Buffer } from 'buffer'
import fs from 'fs';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { addic7edURL } from './helpers.mjs';


export default async function download(subInfo, filename) {
    const response = await fetch(`${addic7edURL}${subInfo.link}`, {
        headers: {
            'Referer': `${addic7edURL}${subInfo.referer || '/show/1'}`,
        },
        follow: 0,
    });

    const body = await response.arrayBuffer();
    const fileContentBuffer = Buffer.from(body);
    let fileContent = iconv.decode(fileContentBuffer, 'utf8');

    if (~fileContent.indexOf('�')) {
        // File content seems badly encoded, try to decode again
        // -----------------------------------------------------
        fileContent = iconv.decode(fileContentBuffer, 'binary');
    }

    return new Promise(resolve => {
        fs.writeFile(filename, fileContent, 'utf8', resolve);
    });
}
