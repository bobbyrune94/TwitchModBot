const fs = require('fs');
const path = require('node:path');

const CONFIG_FILE_NAME = path.join(__dirname, 'streamer-configs.json');

function getStreamerConfigs() {
    let streamerConfigs = JSON.parse(fs.readFileSync(CONFIG_FILE_NAME, {encoding:'utf8', flag:'r'}));
    return streamerConfigs;
}

function setStreamerConfigs(streamerConfigString) {
    try {
        console.log(streamerConfigString)
        fs.writeFileSync(CONFIG_FILE_NAME, streamerConfigString);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getStreamerConfigs,
    setStreamerConfigs
}