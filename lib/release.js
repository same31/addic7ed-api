var episodeParser = require('episode-parser');

function parseTeam ( team ) {
    return (/^(REPACK|PROPER|[XH].?264|HDTV|480P|720P|1080P|2160P|WEB.DL|WEB.?RIP|WR|BRRIP|BDRIP|BLURAY)$/i.test(team) ? 'UNKNOWN' : team).toUpperCase();
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
    var group = opts.el.find('.NewsTitle').text().trim().replace(/^Version (.+?), .+ MBs$/, '$1');
    var hdQuality = Boolean(opts.el.find('.NewsTitle img[title="720/1080"]').length);
    var file = opts.meta.show + '.S' + opts.meta.season + 'E' + opts.meta.episode + '.' + (hdQuality ? '720p.' : '') + parseDistribution(group) + '-' + parseTeam(group) + '.srt';
    return file;
}

function parse ( release ) {
    var parsed = episodeParser(release);
    return {
        team: parsed.group,
        distribution: parsed.source || 'unknown',
        version: parsed.source || 'unknown',
    };
}

module.exports.format = format;
module.exports.parse = parse;
