const pollHeaders = {
    'Authorization': 'Bearer qt0ojj5l3x1nzpiuk9r3l5ty0zu5od',
    'Client-Id': '84zw5yyzedkhgsg2u5tnw66xsk1ulw',
    'Content-Type': 'application/json'
}

function createPollHandler(client, channel, broadcasterId, command, args) {
    let duration = parseInt(args[0]);
    if (isNaN(duration)) {
        client.say(channel, "Duration parameter not a number. Try Again.");
        return;
    }

    if (command === 'starterpoll') {
        createStartersPoll(client, channel, broadcasterId, duration);
        return;
    } else if (command === 'bpoll') {
        createBinaryPoll(client, channel, broadcasterId, duration, args);
    } else if (command === 'poll') {
        createPoll(client, channel, broadcasterId, duration, args);
    }
}

function createStartersPoll(client, _, broadcasterId, duration) {
    sendCreatePollRequest(client,
        broadcasterId, 
        'Which Starter?', 
        ['Grass (Left)', 'Fire (Middle)', 'Water (Right)'], 
        duration);
}

function createBinaryPoll(client, channel, broadcasterId, duration, args) {
    if (args.length != 2 && args.length != 4) {
        client.say(channel, "Invalid Number of Poll Parameters. Try Again.");
        return;
    }

    let options = args.length == 2 ? ['Yes', 'No'] : [args[2], args[3]];
    sendCreatePollRequest(client,
        channel,
        broadcasterId, 
        args[1], 
        options, 
        duration);
}

function createPoll(client, channel, broadcasterId, duration, args) {
    let numOptions = parseInt(args[1]);
    if (isNaN(numOptions)) {
        client.say(channel, "Unable to determine number of options. Try Again.");
        return;
    }

    if(args.length != numOptions + 3) {
        client.say(channel, `Mismatched Number of Options. You said there would be ${numOptions} options, but I found ${args.length - 3}. Try Again.`);
        return;
    }

    let question = args[2];
    let options = [];
    for(let i = 0; i < numOptions; i++) {
        options.push(args[3 + i]);
    }

    sendCreatePollRequest(client,
        channel,
        broadcasterId, 
        question, 
        options, 
        duration);
}

function sendCreatePollRequest(client, channel, broadcasterId, pollTitle, optionsList, pollDuration) {
    let requestBody = {
        "broadcaster_id": broadcasterId,
        "title" : pollTitle,
        "choices": optionsList.map(option => ({ "title": option })),
        "duration": pollDuration
    }

    fetch('https://api.twitch.tv/helix/polls', {
        method: 'POST',
        headers: pollHeaders,
        body: JSON.stringify(requestBody),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
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
    })
}

module.exports = {
    createPollHandler
}