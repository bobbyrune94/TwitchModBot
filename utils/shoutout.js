const { sendGetUserDataRequestWithUsername, sendGetUserDataRequestWithUserId } = require('./twitch-api.js');

const shoutoutCooldownMillis = 5400000;

function addShoutouts(client, channel, broadcasterId, streamerConfigs, users) {
    let config = streamerConfigs[broadcasterId];
    sendGetUserDataRequestWithUsername(users).then((data) => {
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

function shoutoutUser(client, channel, username, shoutoutCooldowns) {
    sendGetUserDataRequestWithUsername([username]).then((data) => {
        if (data['data'] != undefined) {
            for (let user of data['data']) {
                if (Date.now() - shoutoutCooldowns[user['id']] > shoutoutCooldownMillis) {
                    client.say(channel, `!so ${user['login']}`);
                    shoutoutCooldowns[user['id']] = Date.now();
                } else {
                    console.log('Shout out in cooldown');
                }
            }
            console.log(shoutoutCooldowns);
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function removeShoutout(client, channel, username, streamerConfig) {
    sendGetUserDataRequestWithUsername([username]).then((data) => {
        if (data['data'] != undefined) {
            for (let user of data['data']) {
                let index = streamerConfig['shoutouts'].indexOf(user['id']);
                if(index != -1) {
                    streamerConfig['shoutouts'].splice(index, 1);
                    console.log(streamerConfig);
                    client.say(channel, `${username} removed from automated shoutout list`);
                } else {
                    client.say(channel, `${username} not found in automated shoutout list`);
                }
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
    addShoutouts,
    shoutoutUser,
    generateShoutoutCooldowns,
    removeShoutout
}