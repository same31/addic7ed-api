var request = require('request-promise'),
    langs   = require('langs'),
    helpers = require('./helpers');

function search (show, season, episode, languages) {
    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
    };

    return request({
        uri:     helpers.addic7edURL + '/search.php',
        qs:      {
            search: show.trim() + ' ' + helpers.formatShowNumber(season) + 'x' + helpers.formatShowNumber(episode)
        },
        headers: headers
    }).then(function (body) {
        if (/<b>\d+ results found<\/b>/.test(body)) {
            if (~body.indexOf('<b>0 results found<\/b>')) {
                // No result
                // ---------
                return [];
            }
            // Follow first result
            // -------------------
            var urlMatch = body.match(/href="(serie.+?)"/),
                url      = urlMatch[1];
            if (!url) {
                return console.log('[Search] Addic7ed.com error: result not found.');
            }

            return request({
                uri:     helpers.addic7edURL + '/' + url,
                headers: headers
            })
                .then(function (body) {
                    return findSubtitles(body, languages);
                })
                .catch(searchError);
        }

        return findSubtitles(body, languages);
    }).catch(searchError);
}

function findSubtitles (body, languages) {
    var subs          = [],
        refererMatch  = body.match(/\/show\/\d+/),
        referer       = refererMatch ? refererMatch[0] : '/show/1',
        versionRegExp = /Version (.+?),([^]+?)<\/table/g,
        versionMatch,
        version,
        subInfoRegExp = /class="language">([^]+?)<a[^]+?(% )?Completed[^]+?href="([^"]+?)"><strong>(?:most updated|Download)/g,
        subInfoMatch,
        lang,
        langId,
        notCompleted,
        link,
        distributionMatch,
        distribution,
        team;

    // Find subtitles HTML block parts
    // ===============================
    while ((versionMatch = versionRegExp.exec(body)) !== null) {
        version = versionMatch[1].toUpperCase();

        while ((subInfoMatch = subInfoRegExp.exec(versionMatch[2])) !== null) {
            notCompleted = subInfoMatch[2];
            if (notCompleted) {
                continue;
            }

            lang = subInfoMatch[1];
            // Find lang iso code 2B
            // ---------------------
            langId = langs.where('name', lang.replace(/\(.+\)/g, '').trim());
            langId = langId && langId['2B'] || lang.substr(0, 3).toLowerCase();

            link = subInfoMatch[3];

            if (languages && !~languages.indexOf(langId)) {
                continue;
            }

            distributionMatch = version.match(/HDTV|WEB.DL|WEB.?RIP|WR|BRRIP|BDRIP|BLURAY/i);

            distribution = distributionMatch
                ? distributionMatch[0].toUpperCase()
                .replace(/WEB.DL|WEB.?RIP|WR/, 'WEB-DL')
                .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
                : 'UNKNOWN';

            team = version.replace(/.?(REPACK|PROPER|[XH].?264|HDTV|480P|720P|1080P|2160P|WEB.DL|WEB.?RIP|WR|BRRIP|BDRIP|BLURAY)+.?/g, '')
                    .trim().toUpperCase() || 'UNKNOWN';

            subs.push({
                lang:         lang,
                langId:       langId,
                distribution: distribution,
                team:         team,
                version:      version,
                link:         link,
                referer:      referer
            });
        }
    }

    return subs;
}

function searchError (err) {
    return console.log('[Search] Addic7ed.com error', err.statusCode, err.options && err.options.qs.search);
}

module.exports = search;
