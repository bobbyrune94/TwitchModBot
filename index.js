const tmi = require('tmi.js');
const { bobbyruneAccountAuth } = require('./config.js');
const { createPollHandler } = require('./utils/polls.js');
const { createPredictionHandler } = require('./utils/prediction.js');
const { addShoutout } = require('./utils/shoutout.js');
const { getStreamerConfigs } = require('./utils/file.js');

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: 'kungfu_kenny98',
        password: bobbyruneAccountAuth
    },
    channels: [ 'kungfu_kenny98' ]
});

const accountToIdMap = {
    "kungfu_kenny98": "601564078"
}

let streamerConfigs = getStreamerConfigs();
console.log(streamerConfigs);

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) {
        return;
    }

    // console.log(tags);

    console.log(`${tags['display-name']}: ${message}`);

    if (message.startsWith('!')) {
        const args = message.slice(1).match(/(?:[^\s"]+|"[^"]*")+/g);
        const command = args.shift().toLowerCase();
        const broadcasterId = accountToIdMap[channel.slice(1).toLowerCase()];

        if(command === 'starterpoll' || command === 'bpoll' || command === 'poll') {
            createPollHandler(client, channel, broadcasterId, command, args);
        } else if (command === 'bpredict' || command === 'predict') {
            createPredictionHandler(client, channel, broadcasterId, command, args);
        } else if (command === 'so' || command === 'shoutout') {
            if(tags['mod'] === true || tags['username'] === channel.slice(1)) {
                addShoutout(client, channel, streamerConfigs, args);
            }
        }
        else {
            console.log(args);
        }
    }
});
