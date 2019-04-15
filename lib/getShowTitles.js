var request = require('request-promise-native'),
    helpers = require('./helpers');

function getShowTitles () {
    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    };

    return request({
        uri:     helpers.addic7edURL,
        headers: headers
    }).then(function (body) {
        // Find all show titles
        // -------------------------------------------------
        var regexp   = /<option value="\d+" >([^<]*)<\/option>/gm;            
        let match, 
        showTitles = [];
        while ((match = regexp.exec(body)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (match.index === regexp.lastIndex) {
                regexp.lastIndex++;
            }
            showTitles.push(match[1].replace('&amp;', '&'));
        }

        return showTitles;
    }).catch(getShowTitlesError);
}

function getShowTitlesError (err) {
    return console.log('[GetShowTitlesError] Addic7ed.com error', err.statusCode, err.options && err.options.qs.search);
}

module.exports = getShowTitles;
