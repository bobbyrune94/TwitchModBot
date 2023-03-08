function parseTimeFormat(timeString) {
    let splitString = timeString.split(':').reverse().map((string) => parseInt(string));
    if(splitString.length > 3 || splitString.includes(NaN)) {
        return -1;
    }
    let seconds = 0;
    for(let i = 0; i < splitString.length; i++) {
        switch (i) {
            case 0:
                seconds += splitString[i];
                break;
            case 1:
                seconds += splitString[i] * 60;
                break;
            case 2:
                seconds += splitString[i] * 3600;
                break;
        }
    }
    return seconds;
}

function createTimer(client, channel, timeString) {
    if(timeString == undefined) {
        client.say(channel, 'Please specify a time for the timer');
        return;
    }
    let seconds = parseTimeFormat(timeString);
    if(seconds == -1) {
        client.say(channel, 'Invalid Time String. Should be in format of hours:minutes:seconds, minutes:seconds, or seconds');
        return;
    }
    client.say(channel, `Creating timer for ${seconds} seconds`);
}

module.exports = {
    createTimer
}