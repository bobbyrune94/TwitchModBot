const { sendGetUserDataRequest } = require('./twitch-api.js');

function addShoutout(client, channel, streamerConfigs, args) {
    sendGetUserDataRequest(args[0]).then((data) => {
        console.log(data);
    })
}

module.exports = {
    addShoutout
}