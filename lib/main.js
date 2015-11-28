var request = require('request');

function formatShowNumber(number) {
    return parseInt(number) < 10 ? '0' + number : number;
}

function searchSubtitles(show, season, episode, languages, callback) {
    request({
        uri: 'http://www.addic7ed.com/search.php',
        qs: {
            search: show.trim() + ' ' + formatShowNumber(season) + 'x' + formatShowNumber(episode)
        }
    }, function (error, response, body) {
        if (error || !body.trim()) {
            return console.log('Error', error, body);
        }

        var subs = {},
            versionRegExp = /Version (.+?),([^]+?)<\/table/g,
            versionMatch,
            version,
            subInfoRegExp = /class="language">([^]+?)<a[^]+?(% )?Completed[^]+?href="([^"]+?)"><strong>(?:most updated|Download)/g,
            subInfoMatch,
            lang,
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
                lang = subInfoMatch[1].substr(0, 3).toLowerCase();
                link = subInfoMatch[3];

                if (languages && !~languages.indexOf(lang)) {
                    continue;
                }

                subs[lang] || (subs[lang] = {});

                distributionMatch = version.match(/WEB.DL|WEB.?RIP|BRRIP|BDRIP|BLURAY/i);

                distribution = distributionMatch
                    ? distributionMatch[0].toUpperCase()
                    .replace(/WEB.DL|WEB.?RIP/, 'WEB-DL')
                    .replace(/BRRIP|BDRIP|BLURAY/, 'BLURAY')
                    : 'HDTV';

                subs[lang][distribution] || (subs[lang][distribution] = []);

                team = distribution === 'HDTV' ? version.replace(/.?(REPACK|PROPER|X264|HDTV|480P|720P|1080P|2160P)+.?/g, '').trim().toUpperCase() : '';

                subs[lang][distribution].push({
                    link: 'http://www.addic7ed.com' + link,
                    team: team,
                    version: version
                });
            }
        }

        typeof callback === 'function' && callback(subs);
    });
}
