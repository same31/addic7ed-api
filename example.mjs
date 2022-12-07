import getShowTitles from './lib/getShowTitles.mjs';
import search from './lib/search.mjs';
import download from './lib/download.mjs';

console.log('Searching all show titles...');
const showTitlesList = await getShowTitles();
console.log('All available show titles:', showTitlesList);

console.log('Searching episode subtitles: South Park S25E04');
const subtitlesList = await search('South Park', 25, 4);
const subInfo = subtitlesList && subtitlesList[0];
if (subInfo) {
    console.log('Downloading first result:', subInfo);
    await download(subInfo, './South.Park.S25E04.srt');
    console.log('Subtitles file downloaded.');
}
