const fs = require('fs');

function readConfigFile(filename) {
    let streamerConfigs = JSON.parse(fs.readFileSync(filename, {encoding:'utf8', flag:'r'}));
    return streamerConfigs;
}

function writeConfigFile(filename, configString) {
    try {
        fs.writeFileSync(filename, configString);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    readConfigFile,
    writeConfigFile
}