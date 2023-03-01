const { sendGetUserDataRequestWithUsername, sendGetUserDataRequestWithUserId } = require('./twitch-api.js');

function addShoutout(client, channel, broadcasterId, streamerConfigs, links) {
    console.log("Links found:");
    let users = [];
    for (let link of links) {
        users.push(link[1]);
    }

    let config = streamerConfigs[broadcasterId];
    sendGetUserDataRequestWithUsername(users).then((data) => {
        console.log(streamerConfigs);
        console.log(data);
        if (data['data'] != undefined) {
            for (let user of data['data']) {
                if (!config['shoutouts'].includes(user['id'])) {
                    config['shoutouts'].push(user['id']);
                    client.say(channel, `${user['login']} added to automated shoutouts list`);
                } else {
                    console.log('User already in shoutout list');
                }
            }
            console.log(streamerConfigs);
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function shoutoutUser(client, channel, userId) {
    sendGetUserDataRequestWithUserId([userId]).then((data) => {
        if (data['data'] != undefined) {
            for (let user of data['data']) {
                client.say(channel, `!so ${user['login']}`);
            }
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function generateShoutoutCooldowns(streamerConfigs) {
    let cooldownObj = {};
    for(let streamerId in streamerConfigs) {
        cooldownObj[streamerId] = {};
        for(let shoutoutId of streamerConfigs[streamerId]['shoutouts']) {
            cooldownObj[streamerId][shoutoutId] = new Date(0);
        }
    }
    return cooldownObj;
}

module.exports = {
    addShoutout,
    shoutoutUser,
    generateShoutoutCooldowns
}