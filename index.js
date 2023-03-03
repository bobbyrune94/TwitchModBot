const tmi = require('tmi.js');
const { bobbyruneAccountAuth } = require('./config.js');
const { createPollHandler } = require('./utils/polls.js');
const { createPredictionHandler } = require('./utils/prediction.js');
const { addShoutouts, removeShoutout, shoutoutUser, generateShoutoutCooldowns } = require('./utils/shoutout.js');
const { getStreamerConfigs, setStreamerConfigs } = require('./utils/file.js');

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
const streamerConfigs = getStreamerConfigs();
const shoutoutCooldowns = generateShoutoutCooldowns(streamerConfigs);

const TWITCHLINKREGEX = /(?:https:\/\/)?twitch\.tv\/(\S+)/g;

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
        shoutoutUser(client, channel, args[0], shoutoutCooldowns[broadcasterId]);
    }

    if (message.startsWith('!')) {
        const args = message.slice(1).match(/(?:[^\s"]+|"[^"]*")+/g);
        const command = args.shift().toLowerCase();

        switch(command) {
            case 'starterpoll':
            case 'bpoll':
            case 'poll':
                createPollHandler(client, channel, broadcasterId, command, args);
                break;
            case 'bpredict':
            case 'predict':
                createPollHandler(client, channel, broadcasterId, command, args);
                break;
            case 'stopso':
                removeShoutout(client, channel, args[0], streamerConfigs[broadcasterId]);
                break;
            case 'mockso':
                shoutoutUser(client, channel, args[0], shoutoutCooldowns[broadcasterId]);
                break;
            default:
                console.log(args);
        }
    }

    if (message.match(TWITCHLINKREGEX) != null) {
        if(isModeratorOrBroadcaster(channel, messageTags)) {
            addShoutouts(client, channel, streamerConfigs[broadcasterId], [...message.matchAll(TWITCHLINKREGEX)].map((link) => link[1]));
        }
    }
});

client.on("raided", (channel, username, viewers) => {
    setTimeout(() => {
        client.say(channel, `!so ${username}`);
    }, 5000);
})

function isModeratorOrBroadcaster(channel, messageTags) {
    return messageTags['mod'] === true || messageTags['username'] === channel.slice(1);
}

function exitHandler(options, exitCode) {
    if(options.cleanup) {
        console.log('Process Ending. Writing File');
        setStreamerConfigs(JSON.stringify(streamerConfigs));
    }
    process.exit();
}

process.on('SIGINT', exitHandler.bind(null, {cleanup: true}));