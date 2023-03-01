const tmi = require('tmi.js');
const { bobbyruneAccountAuth } = require('./config.js');
const { createPollHandler } = require('./utils/polls.js');
const { createPredictionHandler } = require('./utils/prediction.js');
const { addShoutout, shoutoutUser, generateShoutoutCooldowns } = require('./utils/shoutout.js');
const { getStreamerConfigs, setStreamerConfigs } = require('./utils/file.js');

const shoutoutCooldownMillis = 5400000;

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
let shoutoutCooldowns = generateShoutoutCooldowns(streamerConfigs);

console.log(shoutoutCooldowns);

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) {
        return;
    }

    console.log(tags);
    console.log(`${tags['display-name']}: ${message}`);

    const broadcasterId = accountToIdMap[channel.slice(1).toLowerCase()];

    if (streamerConfigs[broadcasterId]['shoutouts'].includes(tags['user-id'])) {
        if (Date.now() - shoutoutCooldowns[broadcasterId][args[0]] > shoutoutCooldownMillis) {
            shoutoutUser(client, channel, args[0], shoutoutCooldowns);
            shoutoutCooldowns[broadcasterId][args[0]] = Date.now();
        }
    }

    if (message.startsWith('!')) {
        const args = message.slice(1).match(/(?:[^\s"]+|"[^"]*")+/g);
        const command = args.shift().toLowerCase();

        if(command === 'starterpoll' || command === 'bpoll' || command === 'poll') {
            createPollHandler(client, channel, broadcasterId, command, args);
        } else if (command === 'bpredict' || command === 'predict') {
            createPredictionHandler(client, channel, broadcasterId, command, args);
        } else if (command === 'mockso') {
            if (Date.now() - shoutoutCooldowns[broadcasterId][args[0]] > shoutoutCooldownMillis) {
                shoutoutUser(client, channel, args[0], shoutoutCooldowns);
                shoutoutCooldowns[broadcasterId][args[0]] = Date.now();
            }
        } else {
            console.log(args);
        }
    }

    if (message.match(/(?:https:\/\/)?twitch\.tv\/(\S+)/) != null) {
        if(tags['mod'] === true || tags['username'] === channel.slice(1)) {
            addShoutout(client, channel, broadcasterId, streamerConfigs, [...message.matchAll(/(?:https:\/\/)?twitch\.tv\/(\S+)/g)]);
        }
    }
});

function exitHandler(options, exitCode) {
    if(options.cleanup) {
        console.log('Process Ending. Writing File');
        setStreamerConfigs(JSON.stringify(streamerConfigs));
    }
    process.exit();
}

process.on('SIGINT', exitHandler.bind(null, {cleanup: true}));