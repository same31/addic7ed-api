var request = require('request-promise'),
    cheerio = require('cheerio'),
    date    = require('date.js'),
    url     = require('url'),
    xtend   = require('xtend'),
    uniqBy  = require('lodash.uniqby'),
    release = require('./release'),
    helpers = require('./helpers'),
    langs   = require('../lang.json');

function search (show, season, episode, languages) {
    var headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0'
    };
    var meta = {
        show: show.trim(),
        season: helpers.formatShowNumber(season),
        episode: helpers.formatShowNumber(episode)
    };
    var lang = [].concat(languages).map(function ( l ) {
        return l.toLowerCase();
    });
    var langId = uniqBy(langs.filter(function ( l ) {
        return lang.indexOf(l.shortTitle) !== -1;
    }), 'shortTitle');

    return request({
        uri:     helpers.addic7edURL + '/search.php',
        qs:      {
            search: meta.show + ' ' + meta.season + 'x' + meta.episode
        },
        headers: headers,
        resolveWithFullResponse: true
    }).then(function ( res ) {

        var href = url.parse(res.request.href);
        var isEpisodePage = /serie\//.test(href.pathname);

        var $ = cheerio.load(res.body);
        var results = $('a[href^="serie/"]');

        if ( !isEpisodePage ) {
            if ( !results.length ) {
                // No results
                return [];
            }
            // Follow first result
            href.pathname = results.first().attr('href');
        }

        href.pathname = href.pathname.split('/');
        href.pathname.pop();
        href.pathname = href.pathname.join('/');

        return Promise.all(langId.map(function ( l ) {
            var _href = xtend({}, href);
            _href.pathname += '/' + l.id;
            return request({
                uri:     url.format(_href),
                headers: headers
            });
        }));

    })
        .then(function (res) {
            return res
                .map(function ( body ) {
                    return findSubtitles(body, meta);
                })
                .reduce(function ( prev, next ) {
                    return prev.concat(next);
                });
        })
        .catch(searchError);
}

function findSubtitles (body, meta) {

    var $ = cheerio.load(body);
    var subs = $('#container95m').get();

    subs.pop();

    return subs.map(function ( el ) {

        var $sub = $(el);

        // Language
        var lang = $sub.find('td.language').text().trim();

        // Language ID
        var langId = langs.filter(function ( l ) {
            return lang === l.title;
        });

        if ( langId ) {
            langId = langId[0];
        }

        // Completed
        var completed = $sub.find('td.language + td').text().trim() === 'Completed';

        // Download links
        var allLinks = $sub.find('.buttonDownload').map(function ( i, el ) {
            var $el = $(el);
            var type = $el.text().toLowerCase();
            if ( type === 'download' ) {
                type = 'original';
            }
            return {
                type: type,
                url: $el.attr('href')
            };
        }).get();

        // Latest link
        var link = [].concat(allLinks).pop().url;

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
        }).get().pop();

        // Corrected
        var corrected = Boolean($sub.find('.newsDate[colspan="2"] img[title="Corrected"]').length);

        // Hearing impaired
        var hearingImpaired = Boolean($sub.find('.newsDate[colspan="2"] img[title="Hearing Impaired"]').length);

        // Uploader
        var _uploader = $sub.find('a[href^="/user/"]');
        var uploader = {
            name: _uploader.text(),
            url: _uploader.attr('href')
        };

        // Publication date
        var pubDate = date($sub.find('a[href^="/user/"]').parent().contents().last().text().trim()).toISOString();

        // Release
        var releaseFormat = release.format({
            el: $sub,
            meta: meta
        });
        var releaseParse = release.parse(releaseFormat);

        return {
            lang: lang,
            langId: langId.shortTitle,
            group: releaseParse.group,
            distribution: releaseParse.distribution,
            worksWith: releaseParse.worksWith,
            allLinks: allLinks,
            link: link,
            referer: referer,
            description: description,
            stats: stats,
            corrected: corrected,
            hearingImpaired: hearingImpaired,
            uploader: uploader,
            pubDate: pubDate,
            completed: completed
        };

    });

}

function searchError (err) {
    return console.log('[Search] Addic7ed.com error', err.statusCode, err.options && err.options.qs.search);
}

module.exports = search;
