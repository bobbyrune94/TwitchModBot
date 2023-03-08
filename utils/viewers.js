const { sendGetViewersRequest, sendGetUserDataRequestWithUsername, sendViewbotCheckRequest } = require('./twitch-api.js');

function getStreamViewers(channel) {
    return sendGetViewersRequest(channel).then((data) => {
        console.log(data);
        return data['chatters']['viewers'];
    })
}

function detectViewBots(client, channel, botsList) {
    getStreamViewers('sbcoop').then((viewers) => {
        if(viewers.length == 0) {
            return;
        }
        sendGetUserDataRequestWithUsername(viewers).then((userData) => {
            let userIds = userData['data'].map((data) => data['id']);
            let currentBotsList = [];
            for (let userId of userIds) {
                if(botsList['known-bots'].includes(userId)) {
                    currentBotsList.push(userData['display-name']);
                } else if(botsList['known-viewers'].includes(userId)) {
                    
                } else {
                    sendViewbotCheckRequest(userId).then((data) => {
                        if(data['code'] == 404) {
                            botsList['known-viewers'].push(userId);
                        } else {
                            botsList['known-bots'].push(userId);
                            currentBotsList.push(userData['display-name']);
                        }
                        console.log(data);
                    })
                }
            }

            console.log(currentBotsList);
            if(currentBotsList.length == 0) {
                client.say(channel, 'No viewbots detected.');
            } else {
                client.say(channel, `Viewbots detected: ${currentBotsList}`);
            }
        })
    })
}

module.exports = {
    detectViewBots
}