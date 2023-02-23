const tmi = require('tmi.js');
const { createPollHandler } = require('./utils/polls.js');

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: 'kungfu_kenny98',
        password: 'oauth:dpkm39s2pv7ul3obu12m0p42zjdgon' // bobbyrune94
        // password: 'oauth:bk7a4jyf9fjvah4pog4qnfndptnkya' // kungfu_kenny98
    },
    channels: [ 'kungfu_kenny98' ]
});

const accountToIdMap = {
    "kungfu_kenny98": "601564078"
}

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) {
        return;
    }

    console.log(`${tags['display-name']}: ${message}`);

    if (message.startsWith('!')) {
        const args = message.slice(1).match(/(?:[^\s"]+|"[^"]*")+/g);
        const command = args.shift().toLowerCase();
        const broadcasterId = accountToIdMap[channel.slice(1).toLowerCase()];

        if(command === 'starterpoll' || command === 'bpoll' || command === 'poll') {
            createPollHandler(client, channel, broadcasterId, command, args);
        }
        else {
            console.log(args);
        }
    }

    // console.log(tags);
});
