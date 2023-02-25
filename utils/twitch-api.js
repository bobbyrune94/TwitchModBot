const { pollPredictHeader, getUserDataHeader } = require('../config.js');

function sendGetUserDataRequest(usernames) {
    let params = usernames.join('&login=');
    return fetch('https://api.twitch.tv/helix/users?login=' + params, {
        headers: getUserDataHeader,
    })
    .then((res) => res.json())
    .then((data) => {
        return data;
    })
}

function sendCreatePollRequest(broadcasterId, pollTitle, optionsList, pollDuration) {
    let requestBody = {
        "broadcaster_id": broadcasterId,
        "title" : pollTitle,
        "choices": optionsList.map(option => ({ "title": option })),
        "duration": pollDuration
    }

    return fetch('https://api.twitch.tv/helix/polls', {
        method: 'POST',
        headers: pollPredictHeader,
        body: JSON.stringify(requestBody),
    })
    .then((res) => res.json())
    .then((data) => {
        return data;
    })
}

function sendCreatePredictionRequest(broadcasterId, predictionTitle, optionsList, predictWindow) {
    let requestBody = {
        "broadcaster_id": broadcasterId,
        "title" : predictionTitle,
        "outcomes": optionsList.map(option => ({ "title": option })),
        "prediction_window": predictWindow
    }

    return fetch('https://api.twitch.tv/helix/predictions', {
        method: 'POST',
        headers: pollPredictHeader,
        body: JSON.stringify(requestBody),
    })
    .then((res) => res.json())
    .then((data) => {
        return data;
    })
}

module.exports = {
    sendCreatePollRequest,
    sendCreatePredictionRequest,
    sendGetUserDataRequest
}