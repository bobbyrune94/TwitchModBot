const fs = require('fs');
const path = require('node:path');

function getStreamerConfigs() {
    let files = fs.readdirSync(path.join(__dirname, '..', 'streamer_configs'));
    console.log(files);

    let streamerConfigs = {};

    for (let file of files) {
        console.log(file);
        let streamerName = file.slice(0, -12);
        streamerConfigs[streamerName] = fs.readFile(path.join(__dirname, '..', 'streamer_configs', file), (err, jsonString) => {
            if (err) {
                console.log(`File ${file} read failed: ${err}`);
                return;
            }
            console.log(`File read successfully. Data: ${jsonString}`);
        });
    }

    return streamerConfigs;
}

module.exports = {
    getStreamerConfigs
}