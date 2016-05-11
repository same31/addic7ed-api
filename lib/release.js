var episodeParser = require('episode-parser');

var workingCombinations = [
    ['LOL', 'SYS', 'DIMENSION'],
    ['XII', 'ASAP', 'IMMERSE']
];

function parseReleaseGroup ( group ) {
    return (/^(REPACK|PROPER|[XH].?264|HDTV|480P|720P|1080P|2160P|WEB.DL|WEB.?RIP|WR|BRRIP|BDRIP|BLURAY)$/i.test(group) ? 'UNKNOWN' : group).toUpperCase();
}

function parseDistribution ( distribution ) {
    var str = 'UNKNOWN';
    if ( /^(WEB.DL|WEB.?RIP|WR)$/i.test(distribution) ) {
        str = 'WEB-DL';
    } else if ( /^(BRRIP|BDRIP|BLURAY)$/i.test(distribution) ) {
        str = 'BLURAY';
    }
    return str.toUpperCase();
}

function format ( opts ) {
    var group = opts.el.find('.NewsTitle').text().trim().replace(/^Version (.+?), .+ MBs$/, '$1').split('.').shift();
    var hdQuality = Boolean(opts.el.find('.NewsTitle img[title="720/1080"]').length);
    var file = opts.meta.show + '.S' + opts.meta.season + 'E' + opts.meta.episode + '.' + (hdQuality ? '720p.' : '') + parseDistribution(group) + '-' + parseReleaseGroup(group) + '.srt';
    return file;
}

function parse ( release ) {
    var parsed = episodeParser(release);
    var worksWith = workingCombinations.reduce(function ( prev, next ) {
        var index = next.indexOf(parsed.group);
        var arr = [].concat(prev);
        if ( index !== -1 ) {
            arr = arr.concat(next);
            arr.splice(index, 1);
        }
        return arr;
    }, []);
    return {
        group: parsed.group || 'UNKNOWN',
        worksWith: worksWith || [],
        distribution: parsed.source || 'UNKNOWN'.toLowerCase()
    };
}

module.exports.format = format;
module.exports.parse = parse;
