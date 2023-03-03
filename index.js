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
        shoutoutUser(client, channel, args[0], shoutoutCooldowns[broadcasterId]);
    }

    if (message.startsWith('!')) {
        const args = message.slice(1).match(/(?:[^\s"]+|"[^"]*")+/g);
        const command = args.shift().toLowerCase();

        if(command === 'starterpoll' || command === 'bpoll' || command === 'poll') {
            createPollHandler(client, channel, broadcasterId, command, args);
        } else if(command === 'bpredict' || command === 'predict') {
            createPredictionHandler(client, channel, broadcasterId, command, args);
        } else if(command === 'stopso') {
            removeShoutout(client, channel, args[0], streamerConfigs[broadcasterId]);
        } else if(command === 'mockso') {
            shoutoutUser(client, channel, args[0], shoutoutCooldowns[broadcasterId]);
        } else {
            console.log(args);
        }
    }

    if (message.match(/(?:https:\/\/)?twitch\.tv\/(\S+)/) != null) {
        if(tags['mod'] === true || tags['username'] === channel.slice(1)) {
            let links = [...message.matchAll(/(?:https:\/\/)?twitch\.tv\/(\S+)/g)];
            addShoutouts(client, channel, broadcasterId, streamerConfigs, links.map((link) => link[1]));
        }
    }
});

client.on("raided", (channel, username, viewers) => {
    setTimeout(() => {
        client.say(channel, `!so ${username}`);
    }, 5000);
})

function exitHandler(options, exitCode) {
    if(options.cleanup) {
        console.log('Process Ending. Writing File');
        setStreamerConfigs(JSON.stringify(streamerConfigs));
    }
    process.exit();
}

process.on('SIGINT', exitHandler.bind(null, {cleanup: true}));