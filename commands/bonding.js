const fs = require("fs-extra");
const moment = require("moment");

// const
const team_data_path_prefix = "./challenge-data/team-data/";
const game_data_path_prefix = "./challenge-data/game-data/";
const hint_time_distance_minutes = 5;
const millisec = 60000;
const max_challenge = 5;

// message
const CORRECT_ANSWER = "Your answer is correct!";
const INCORRECT_ANSWER = "Your answer is incorrect";
const NEXT_CHALLENGE = "Moving to the next challenge!!!...";
const GAME_FINISHED = "Game finished, congratulations!";

// utils functions
function formatAnswer(str) {
    str = str.replace(/\s+/g,' ').trim();
    return str.toLowerCase();
}

function saveTeamInfo(team_info) {
    var data_path = team_data_path_prefix + `${team_info.team_id}.json`;
    console.log(data_path, team_info);
    fs.writeJSONSync(data_path, team_info); 
}

function loadTeamInfo(message) {
    var teamID = message.channel.name;
    var data_path = team_data_path_prefix + `${teamID}.json`;
    return fs.readJSONSync(data_path);
}

function loadGameInfo(challengeID) {
    var formatted_number = String(challengeID).padStart(2, '0');
    var data_path = game_data_path_prefix + `game${formatted_number}.json`;
    return fs.readJSONSync(data_path);
}

function startChallenge(challengeID, team_info, message) {
    // challenge id must be an int
    message.channel.send("Challenge #" + challengeID.toString());

    game_info = loadGameInfo(challengeID);
    
    message.channel.send({files: [game_info.challenge_title]}); 

    team_info.current_challenge = challengeID;
    team_info.usedHints = 0;
    const currentdate = new Date();
    team_info.team_timestamps.push(currentdate.getTime());
    saveTeamInfo(team_info);
}

function checkResult(challengeID, team_answer, team_info, message) {
    if (challengeID == 1) {
        var data = fs.readJSONSync(`./challenge-data/game1-data/${team_info.team_id}.json`);
        var resStr = data.resStr;
        var usrStr = team_answer;
        var countCorrect = 0;
        for (var t = 0; t < resStr.length; t++)
            countCorrect += (resStr[t] == usrStr[t]);
        if (countCorrect == resStr.length) {
            message.reply(CORRECT_ANSWER);
            message.channel.send(NEXT_CHALLENGE);
            startChallenge(2, team_info, message);
        }
        else message.reply(`Hooray! You correctly guessed ${countCorrect} number(s).`);
    }
    else {
        game_info = loadGameInfo(challengeID);
        team_info.team_attempt_count += 1;
        if (formatAnswer(game_info.challenge_answer) == formatAnswer(team_answer)) {
            if (challengeID == max_challenge) {
                const currentdate = new Date();
                // if finish then push the finishing time to team_timestamps
                team_info.team_timestamps.push(currentdate.getTime());
                team_info.current_challenge += 1;
                message.reply(CORRECT_ANSWER);
                message.channel.send(GAME_FINISHED);
                message.channel.send("Your start time: " + moment.unix(team_info.team_timestamps[0] / 1000).format("DD/MM/YYYY - HH:mm:ss"));
                message.channel.send("Your end time: " + moment.unix(team_info.team_timestamps.at(-1) / 1000).format("DD/MM/YYYY - HH:mm:ss"));
                var duration = moment.duration(team_info.team_timestamps.at(-1) - team_info.team_timestamps[0]);
                message.channel.send(`Duration: ${duration.hours()} hour(s), ${duration.minutes()} minute(s) and ${duration.seconds()} second(s)`);
                saveTeamInfo(team_info);
            }
            else {
                message.reply(CORRECT_ANSWER);
                message.channel.send(NEXT_CHALLENGE);
                startChallenge(challengeID + 1, team_info, message);
            }
        }
        else {
            message.reply(INCORRECT_ANSWER);
            saveTeamInfo(team_info);
        }
    }
}

function showHint(game_info, hintID, message) {
    if (hintID > game_info.challenge_hints.length) {
        message.reply("There is a bug in the bot! Let's call admin for a quick fix!!!! Err: hintID too large");
    }
    else {
        message.channel.send(`Hint #${hintID}`);
        message.channel.send(game_info.challenge_hints[hintID - 1]);
    }
}

module.exports = {
	name: 'bonding',
	description: 'AI Club bonding bot',
	execute(message) {
        const user_args = message.content.split(" ");

        if (user_args.length == 1) {
            message.reply("Type `!bonding help` for usage");
        }
        else {
            var requested_command = user_args[1];
            switch (requested_command) {
                case "help": {
                    message.channel.send("Type `!bonding start` to start the game");
                    message.channel.send("Type `!bonding hint` to get the hint of the current challenge");
                    message.channel.send("Type `!bonding answer` to submit your answer (if you have multiple answers, submit using the following syntax: `!bonding answer <ans1>;<ans2>;<ans3>`");
                    message.channel.send("Note: If your answer is correct, I will automatically show the next challenge (if available).");
                    break;
                }
                case "team-register": {
                    var requested_team = user_args[2];
                    console.log(message.channel.name);
                    team_data.forEach(team_info => {
                        if (team_info.team_id == requested_team) {
                            let role = message.guild.roles.cache.find(r => r.name === requested_team);
                            message.member.roles.add(role);
                            message.reply("Added to " + requested_team);
                        }
                    });
                    break;
                }
                case "start": {
                    // use message.channel.name to get the channel name
                    if (!message.channel.name.startsWith("team")) {
                        message.reply("You must use an assigned channel of your team to use this command.");
                    }
                    else {
                        var team_info = loadTeamInfo(message);
                        if (team_info.current_challenge != 0) {
                            message.reply("The game has already started!");
                        }
                        else {
                            message.reply("Your game will be started in...");
                            for (var i = 3; i > 0; i--)
                                message.channel.send(i.toString());
                            message.channel.send("Good luck!");
                            startChallenge(1, team_info, message);
                        }
                    }

                    break;
                }
                case "hint": {
                    if (!message.channel.name.startsWith("team")) {
                        message.reply("You must use an assigned channel of your team to use this command.");
                    }
                    else {
                        var team_info = loadTeamInfo(message);
                        if (team_info.current_challenge <= max_challenge) {
                            var challengeID = team_info.current_challenge;
                            var game_info = loadGameInfo(challengeID);
                            if (game_info.challenge_hints.length > 0) {
                                const currentdate = new Date();
                                const currentTime = currentdate.getTime();
                                var duration_milis = currentTime - team_info.team_timestamps.at(-1);
                                var duration_minutes = duration_milis / millisec;
                                // max hint can be used at this time
                                var maxHint = Math.min(Math.floor(duration_minutes / hint_time_distance_minutes), game_info.challenge_hints.length);
                                if (team_info.usedHints < maxHint) {
                                    team_info.usedHints += 1;
                                    showHint(game_info, team_info.usedHints, message);
                                    saveTeamInfo(team_info);
                                }
                                else {
                                    if (team_info.usedHints < game_info.challenge_hints.length) {
                                        var next_hint_timestamp = team_info.team_timestamps.at(-1) + (hint_time_distance_minutes * millisec * (team_info.usedHints + 1));
                                        var wait_duration_millis = next_hint_timestamp - currentTime;
                                        var minutes = Math.floor(wait_duration_millis / millisec);
                                        var seconds = ((wait_duration_millis % millisec) / 1000).toFixed(0);
                                        message.reply(`You have to wait for ${minutes} minute(s) and ${seconds} second(s) to get the next hint`);
                                    }
                                    else message.reply("There is no more hint! So sad :(");
                                }
                            }
                            else
                                message.reply("This challenge has no hint! Do it yourself!!!");
                        }
                        else 
                            message.reply(`You have finished all challenges! What do you want from me? Huh?`);
                    }
                    break;
                }
                case "answer": {
                    if (!message.channel.name.startsWith("team")) {
                        message.reply("You must use an assigned channel of your team to use this command.");
                    }
                    else {
                        var team_answer = "";
                        for (var i = 2; i < user_args.length; i++)
                            team_answer += (user_args[i] + (i != user_args.length - 1 ? " " : ""));
                        team_info = loadTeamInfo(message);
                        challengeID = team_info.current_challenge;
                        if (challengeID > max_challenge)
                            message.reply("You have finished the game!");
                        else if (challengeID == 0)
                            message.reply("Wait, don't be hurry! You must start the game before answering!")
                        else checkResult(challengeID, team_answer, team_info, message);
                    }
                    break;
                }
                default: { 
                    message.reply("An unknown command, type `!bonding help` for usage");
                }
            }
        }
	}
};