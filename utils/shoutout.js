const { sendGetUserDataRequest } = require('./twitch-api.js');

function addShoutout(client, channel, streamerConfigs, links) {
    console.log("Links found:");
    let users = [];
    for (let link of links) {
        users.push(link[1]);
    }

    let config = streamerConfigs[channel.slice(1)];
    sendGetUserDataRequest(users).then((data) => {
        console.log(streamerConfigs);
        console.log(data);
        if (data['data'] != undefined) {
            for (let user of data['data']) {
                if (!config['shoutouts'].includes(user['id'])) {
                    config['shoutouts'].push(user['id']);
                }
            }
            console.log(streamerConfigs);
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

module.exports = {
    addShoutout
}