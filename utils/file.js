const fs = require('fs');

function readConfigFile(filename) {
    let configData = JSON.parse(fs.readFileSync(filename, {encoding:'utf8', flag:'r'}));
    return configData;
}

function writeConfigFile(configData, filename) {
    try {
        fs.writeFileSync(filename, configData);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    readConfigFile,
    writeConfigFile
}