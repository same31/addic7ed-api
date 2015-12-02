var request = require('request-promise'),
    langs   = require('langs'),
    helpers = require('./helpers');

function search (show, season, episode, languages) {
    return request({
        uri:     helpers.addic7edURL + '/search.php',
        qs:      {
            search: show.trim() + ' ' + helpers.formatShowNumber(season) + 'x' + helpers.formatShowNumber(episode)
        }
    }).then(function (body) {
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

                distributionMatch = version.match(/WEB.DL|WEB.?RIP|BRRIP|BDRIP|BLURAY/i);

                distribution = distributionMatch
                    ? distributionMatch[0].toUpperCase()
                    .replace(/WEB.DL|WEB.?RIP/, 'WEB-DL')
                    .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
                    : 'HDTV';

                team = distribution === 'HDTV'
                    ? version.replace(/.?(REPACK|PROPER|X264|HDTV|480P|720P|1080P|2160P)+.?/g, '')
                    .trim().toUpperCase()
                    : '';

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
    }).catch(function (err) {
        return console.log('[Search] Addic7ed.com error', err);
    });
}

module.exports = search;
