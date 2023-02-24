const { sendCreatePollRequest } = require('./twitch-api.js');

const bpollFormat1 = `!bpoll [duration] [poll title]`;
const bpollFormat2 = `!bpoll [duration] [poll title] [option 1] [option 2]`;
const pollFormat = `!poll [duration] [number of options] [poll title] [option 1] [option 2] ...`;

function createPollHandler(client, channel, broadcasterId, command, args) {
    let duration = parseInt(args[0]);
    if (isNaN(duration)) {
        client.say(channel, "Duration parameter expected after command. Ex: [command] [duration in seconds]. Try again.");
        return;
    }

    if (command === 'starterpoll') {
        createPoll(client, channel, broadcasterId, duration, 'Which Starter?', ['Grass (Left)', 'Fire (Middle)', 'Water (Right)']);
    } else if (command === 'bpoll') {
        if (args.length != 2 && args.length != 4) {
            client.say(channel, `Invalid Number of Poll Parameters. !bpoll command should either be "${bpollFormat1}" or "${bpollFormat2}". Try again.`);
            return;
        }
    
        let options = args.length == 2 ? ['Yes', 'No'] : [args[2], args[3]];
        createPoll(client, channel, broadcasterId, duration, args[1], options);
    } else if (command === 'poll') {
        let numOptions = parseInt(args[1]);
        if (isNaN(numOptions)) {
            client.say(channel, `Unable to determine number of options. !poll command should be formatted as "${pollFormat}"`);
            return;
        }

        if(args.length != numOptions + 3) {
            client.say(channel, `Mismatched Number of Options. You said there would be ${numOptions} options, but I found ${args.length - 3}. Try Again.`);
            return;
        }

        let options = [];
        for(let i = 0; i < numOptions; i++) {
            options.push(args[3 + i]);
        }
        
        createPoll(client, channel, broadcasterId, duration, args[2], options);
    }
}

function createPoll(client, channel, broadcasterId, duration, title, options) {
    sendCreatePollRequest(
        broadcasterId, 
        title, 
        options, 
        duration)
    .then((data) => {
        if(data['data'] != undefined) {
            client.say(channel, "Poll Created. Cast Your Votes!");
        } else if (data['status'] == 400) {
            if (data['message'].includes('PollAlreadyActive')) {
                client.say(channel, "I cannot create a new poll as there is one currently active.");
            } else {
                client.say(channel, data['message']);
            }
        } else {
            client.say(channel, `Error creating poll. Status: ${data['status']}: ${data['message']}`);
        }
    });
}

module.exports = {
    createPollHandler
}