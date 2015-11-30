var request = require('request-promise'),
    langs   = require('langs'),
    helpers = require('./helpers');

function searchSubtitles (show, season, episode, languages) {
    return request({
        uri: helpers.addic7edURL + '/search.php',
        qs:  {
            search: show.trim() + ' ' + helpers.formatShowNumber(season) + 'x' + helpers.formatShowNumber(episode)
        }
    }).then(function (body) {
        var subs          = {},
            refererMatch  = body.match(/\/show\/\d+/),
            referer       = helpers.addic7edURL + (refererMatch ? refererMatch[0] : '/show/1'),
            versionRegExp = /Version (.+?),([^]+?)<\/table/g,
            versionMatch,
            version,
            subInfoRegExp = /class="language">([^]+?)<a[^]+?(% )?Completed[^]+?href="([^"]+?)"><strong>(?:most updated|Download)/g,
            subInfoMatch,
            lang,
            langCode2B,
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

                lang = subInfoMatch[1].replace(/\(.+\)/g, '').trim();
                langCode2B = langs.where('name', lang);
                langCode2B = langCode2B && langCode2B['2B'] || lang.substr(0, 3).toLowerCase();

                link = subInfoMatch[3];

                if (languages && !~languages.indexOf(langCode2B)) {
                    continue;
                }

                subs[langCode2B] || (subs[langCode2B] = {});

                distributionMatch = version.match(/WEB.DL|WEB.?RIP|BRRIP|BDRIP|BLURAY/i);

                distribution = distributionMatch
                    ? distributionMatch[0].toUpperCase()
                    .replace(/WEB.DL|WEB.?RIP/, 'WEB-DL')
                    .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
                    : 'HDTV';

                subs[langCode2B][distribution] || (subs[langCode2B][distribution] = []);

                team = distribution === 'HDTV'
                    ? version.replace(/.?(REPACK|PROPER|X264|HDTV|480P|720P|1080P|2160P)+.?/g, '')
                    .trim().toUpperCase()
                    : '';

                subs[langCode2B][distribution].push({
                    link:    helpers.addic7edURL + link,
                    team:    team,
                    version: version,
                    referer: referer
                });
            }
        }

        return subs;
    }).catch(function (err) {
        return console.log('[Search] Addic7ed.com error', err);
    });
}

/*searchSubtitles('Marvel\'s Jessica Jones', 1, 6).then(function (subs) {
    console.log(subs);
});*/

module.exports = searchSubtitles;
