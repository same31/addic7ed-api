addic7ed-api
============

API to search and download TV show subtitles files from [www.addic7ed.com](http://www.addic7ed.com) database.


Installation
------------

Like every other npm package, run the command
`npm install addic7ed-api`


Usage example
-------------

Search completed subtitles file for South Park season 25 episode 4.
Download and save the first result.

```javascript
import { search, download } from 'addic7ed-api';

const subtitlesList = await search('South Park', 25, 4);
const subInfo = subtitlesList && subtitlesList[0];
if (subInfo) {
    await download(subInfo, './South.Park.S25E04.srt');
    console.log('Subtitles file downloaded.');
}
```

Search completed subtitles file for Deadpool (2016).
Download and save the first result.

```javascript
import { search, download } from 'addic7ed-api';

const subtitlesList = await search('Deadpool 2016');
const subInfo = subtitlesList && subtitlesList[0];
if (subInfo) {
    await download(subInfo, './deadpool.2016.srt');
    console.log('Subtitles file downloaded.');
}
```

API functions
-------------

### search(title, [season], [episode], [languages])

Search and return a list of completed subtitles.

#### Parameters

+ **title**: The show or movie title
+ **season**: _(optional)_ The season number, integer or string like '01' if it's a show. `null` for movies.
+ **episode**: _(optional)_ The episode number, integer or string like '01' if it's a show. `null` for movies.
+ **languages**: _(optional)_ Limit the search to a list of [ISO 639-2/B](https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes) (3 characters) language codes.
Example: ['fre', 'eng']

#### Return value

Returns a promise which is resolved when the search is complete. This promise returns a list of object containing the subtitles file language, lang code, version and
download link. Distribution (BLURAY, WEB-DL or HDTV) and team (i.e. KILLERS) are extracted from version if possible.


### download(subInfo, filename)

Download and save a subtitles file.

#### Parameters

+ **subInfo**: Object with a link property, typically coming from the _addic7edApi.search()_ method result list.
+ **filename**: The file to write

#### Return value

Returns a promise which is resolved when the file is written.

### getShowTitles()

Return a list of all available show titles.

#### Return value

Returns a promise which is resolved when the get operation is complete. This promise returns a list of show titles.
