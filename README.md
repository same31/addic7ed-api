addic7ed-api
============

API to search and download TV show subtitles files from [www.addic7ed.com](http://www.addic7ed.com) database.


Installation
------------

Like every other npm package, run the command
`npm install addic7ed-api`


Usage example
-------------

Search completed subtitles file for South Park season 19 episode 6.
Download and save the first result.

```javascript
var addic7edApi = require('addic7ed-api');
addic7edApi.search('South Park', 19, 6).then(function (subtitlesList) {
    var subInfo = subtitlesList[0];
    if (subInfo) {
        addic7edApi.download(subInfo, './South.Park.S19E06.srt').then(function () {
            console.log('Subtitles file saved.');
        });
    }
});
addic7edApi.getShowTitles().then(function(showTitlesList){
    console.log('All show titles available:', showTitlesList);
});
```


API functions
-------------

### addic7edApi.search(show, season, episode, [languages])

Search and return a list of completed subtitles.

#### Parameters

+ **show**: The show title
+ **season**: The season number, integer or string like '01'
+ **episode**: The episode number, integer or string like '01'
+ **languages**: _(optional)_ Limit the search to a list of [ISO 639-2/B](https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes) (3 characters) language codes.
Example: ['fre', 'eng']

#### Return value

Returns a promise which is resolved when the search is complete. This promise returns a list of object containing the subtitles file language, lang code, version and
download link. Distribution (BLURAY, WEB-DL or HDTV) and team (i.e. KILLERS) are extracted from version if possible.


### addic7edApi.download(subInfo, filename)

Download and save a subtitles file.

#### Parameters

+ **subInfo**: Object with a link property, typically coming from the _addic7edApi.search()_ method result list.
+ **filename**: The file to write

#### Return value

Returns a promise which is resolved when the file is written.

### addic7edApi.getShowTitles()

Return a list of all available show titles.

#### Return value

Returns a promise which is resolved when the get operation is complete. This promise returns a list of show titles.