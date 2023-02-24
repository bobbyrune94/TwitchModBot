const { pollPredictHeader } = require('../config.js');

const bpredictFormat1 = `!bpredict [duration] [prediction title]`;
const bpredictFormat2 = `!bpredict [duration] [prediction title] [option 1] [option 2]`;
const predictFormat = `!predict [duration] [number of options] [prediction title] [option 1] [option 2] ...`;


function createPredictionHandler(client, channel, broadcasterId, command, args) {
    let duration = parseInt(args[0]);
    if (isNaN(duration)) {
        client.say(channel, "Duration parameter expected after predict command. Ex: [command] [duration in seconds]. Try again.");
        return;
    }

    if (command === 'bpredict') {
        createBinaryPrediction(client, channel, broadcasterId, duration, args);
    } else if (command === 'predict') {
        createPrediction(client, channel, broadcasterId, duration, args);
    }
}

function createBinaryPrediction(client, channel, broadcasterId, duration, args) {
    if (args.length != 2 && args.length != 4) {
        client.say(channel, `Invalid Number of Parameters. !bpredict command should either be "${bpredictFormat1}" or "${bpredictFormat2}". Try again.`);
        return;
    }

    let options = args.length == 2 ? ['Yes', 'No'] : [args[2], args[3]];
    sendCreatePredictionRequest(client,
        channel,
        broadcasterId, 
        args[1], 
        options, 
        duration);
}

function createPrediction(client, channel, broadcasterId, duration, args) {
    let numOptions = parseInt(args[1]);
    if (isNaN(numOptions)) {
        client.say(channel, `Unable to determine number of options. !predict command should be formatted as "${predictFormat}"`);
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

    sendCreatePredictionRequest(client,
        channel,
        broadcasterId, 
        question, 
        options, 
        duration);
}

function sendCreatePredictionRequest(client, channel, broadcasterId, predictionTitle, optionsList, predictWindow) {
    let requestBody = {
        "broadcaster_id": broadcasterId,
        "title" : predictionTitle,
        "outcomes": optionsList.map(option => ({ "title": option })),
        "prediction_window": predictWindow
    }

    fetch('https://api.twitch.tv/helix/predictions', {
        method: 'POST',
        headers: pollPredictHeader,
        body: JSON.stringify(requestBody),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        if(data['data'] != undefined) {
            client.say(channel, "Prediction Created. Gamble those channel points!");
        } else if (data['status'] == 400) {
            client.say(channel, data['message']);
        } else {
            client.say(channel, `Error creating poll. Status: ${data['status']}: ${data['message']}`);
        }
    })
}

module.exports = {
    createPredictionHandler
}