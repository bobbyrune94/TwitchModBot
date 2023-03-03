const { sendGetUserDataRequestWithUsername } = require('./twitch-api.js');

const shoutoutCooldownMillis = 5400000; //1.5 hours

function addShoutouts(client, channel, streamerConfig, users) {
    sendGetUserDataRequestWithUsername(users).then((data) => {
        if (data['data'] != undefined) {
            data['data']
            .filter((user) => !streamerConfig['shoutouts'].includes(user['id']))
            .forEach((user) => {
                streamerConfig['shoutouts'].push(user['id']);
                client.say(channel, `${user['login']} added to automated shoutouts list`);
            })
            console.log(streamerConfig);
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function shoutoutUser(client, channel, username, shoutoutCooldowns) {
    sendGetUserDataRequestWithUsername([username]).then((data) => {
        if (data['data'] != undefined) {
            data['data']
            .filter((user) => Date.now() - shoutoutCooldowns[user['id']] > shoutoutCooldownMillis)
            .forEach((user) => {
                client.say(channel, `!so ${user['login']}`);
                shoutoutCooldowns[user['id']] = Date.now();
            });
            console.log(shoutoutCooldowns);
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function removeShoutout(client, channel, username, streamerConfig) {
    sendGetUserDataRequestWithUsername([username]).then((data) => {
        if (data['data'] != undefined) {
            data['data']
            .filter((user) => streamerConfig['shoutouts'].indexOf(user['id']) != -1)
            .forEach((user) => {
                streamerConfig['shoutouts'].splice(streamerConfig['shoutouts'].indexOf(user['id']), 1);
                console.log(streamerConfig);
                client.say(channel, `${username} removed from automated shoutout list`);
            })
        } else {
            console.log(`Error: Status ${data['status']} ${data['message']}`);
        }
    })
}

function generateShoutoutCooldowns(streamerConfigs) {
    console.log(streamerConfigs);
    console.log(typeof streamerConfigs);

    return Object.keys(streamerConfigs).reduce((cooldownObj, streamerId) => {
        cooldownObj[streamerId] = streamerConfigs[streamerId]['shoutouts'].reduce((configObj, shoutoutId) => {
            configObj[shoutoutId] = new Date(0);
            return configObj;
        }, {});
        return cooldownObj;
    }, {});
}

module.exports = {
    addShoutouts,
    shoutoutUser,
    generateShoutoutCooldowns,
    removeShoutout
}