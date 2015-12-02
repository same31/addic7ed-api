var fs      = require('fs'),
    request = require('request-promise'),
    Promise = require('promise'),
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
            uri:     helpers.addic7edURL + subInfo.link,
            headers: {
                'Referer':       helpers.addic7edURL + (subInfo.referer || '/show/1')
            }
            //,jar: j
        }).then(function (fileContent) {
            fs.writeFile(filename, fileContent, resolve);
        }).catch(reject);
    });
}

module.exports = download;
