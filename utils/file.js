const fs = require('fs');
const path = require('node:path');

function getStreamerConfigs() {
    let files = fs.readdirSync(path.join(__dirname, '..', 'streamer_configs'));
    let streamerConfigs = {};

    for (let file of files) {
        let streamerName = file.slice(0, -12);
        streamerConfigs[streamerName] = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'streamer_configs', file), {encoding:'utf8', flag:'r'})
        );
    }

    return streamerConfigs;
}

module.exports = {
    getStreamerConfigs
}