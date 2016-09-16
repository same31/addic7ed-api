var fs      = require('fs'),
    iconv   = require('iconv-lite'),
    request = require('request-promise-native'),
    helpers = require('./helpers');

function download (subInfo, filename) {
    /*    var j      = request.jar(),
     url    = 'http://www.addic7ed.com';
     j.setCookie(request.cookie('wikisubtitlesuser='+addic7edUser), url);
     j.setCookie(request.cookie('wikisubtitlespass='+addic7edPass), url);
     console.log(j.getCookieString(url));
     */

    return new Promise(function (resolve, reject) {
        request({
            uri:      helpers.addic7edURL + subInfo.link,
            headers:  {
                'Referer': helpers.addic7edURL + (subInfo.referer || '/show/1')
            },
            encoding: null,
            followRedirect: false
            //,jar: j
        }).then(function (fileContentBuffer) {
            var fileContent = iconv.decode(fileContentBuffer, 'utf8');

            if (~fileContent.indexOf('�')) {
                // File content seems bad encoded, try to decode again
                // ---------------------------------------------------
                fileContent = iconv.decode(fileContentBuffer, 'binary');
            }

            fs.writeFile(filename, fileContent, 'utf8', resolve);
        }).catch(reject);
    });
}

module.exports = download;
