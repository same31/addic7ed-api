var request = require('request-promise'),
    langs   = require('langs'),
    cheerio = require('cheerio'),
    release = require('./release'),
    helpers = require('./helpers');

function search (show, season, episode, languages) {
    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
    };
    var meta = {
        show: show.trim(),
        season: helpers.formatShowNumber(season),
        episode: helpers.formatShowNumber(episode)
    };

    return request({
        uri:     helpers.addic7edURL + '/search.php',
        qs:      {
            search: meta.show + ' ' + meta.season + 'x' + meta.episode
        },
        headers: headers
    }).then(function (body) {

        var $ = cheerio.load(body);
        var results = $('a[href^="serie/"]');
        var isEpisodePage = Boolean($('#qssShow').length);

        if ( !isEpisodePage ) {

            if ( !results.length ) {
                // No result
                // ---------
                return [];
            }

            // Follow first result
            // -------------------
            var url      = results.first().attr('href');
            if (!url) {
                return console.log('[Search] Addic7ed.com error: result not found.');
            }

            return request({
                uri:     helpers.addic7edURL + '/' + url,
                headers: headers
            })
                .then(function (body) {
                    return findSubtitles(body, languages, meta);
                })
                .catch(searchError);

        }

        return findSubtitles(body, languages, meta);
    }).catch(searchError);
}

function findSubtitles (body, languages, meta) {

    var $ = cheerio.load(body);
    var subs = $('#container95m').get();

    subs.pop();

    return subs.map(function ( el ) {

        var $sub = $(el);

        // Language
        var lang = $sub.find('td.language').text().trim();

        // Language ID
        var langId = langs.where('name', lang);
        langId = langId && langId['2B'] || lang.substr(0, 3).toLowerCase();

        // Download link (only last one if more are preset)
        var link = $sub.find('.buttonDownload').map(function ( i, el ) {
            return $(el).attr('href');
        }).get().pop();

        // Referer
        var referer = $('a[href^="/show/"]').attr('href');

        // Description
        var description = $sub.find('.newsDate[colspan="3"]').text().trim();

        // Stats
        var stats = $sub.find('.newsDate[colspan="2"]').map(function ( i, item ) {
            var re = /(\d+)/;
            var parts = $(item).text().trim().split(' · ');
            return {
                edits: Number(re.exec(parts[0])[1]),
                downloads: Number(re.exec(parts[1])[1]),
                sequences: Number(re.exec(parts[2])[1])
            };
        }).get();

        // Corrected
        var corrected = Boolean($sub.find('.newsDate[colspan="2"] img[title="Corrected"]').length);

        // Hearing impaired
        var hearingImpaired = Boolean($sub.find('.newsDate[colspan="2"] img[title="Hearing Impaired"]').length);

        // Release
        var releaseFormat = release.format({
            el: $sub,
            meta: meta
        });
        var releaseParse = release.parse(releaseFormat);

        return {
            lang: lang,
            langId: langId,
            team: releaseParse.team,
            distribution: releaseParse.distribution,
            version: releaseParse.version,
            link: link,
            referer: referer,
            description: description,
            stats: stats,
            corrected: corrected,
            hearingImpaired: hearingImpaired
        };

    });

}

function searchError (err) {
    return console.log('[Search] Addic7ed.com error', err.statusCode, err.options && err.options.qs.search);
}

module.exports = search;
