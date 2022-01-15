const fs = require("fs-extra");

var data = JSON.parse(fs.readFileSync("./datagame/dmdunglailaptrinh.json", 'utf-8'));

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var count = 0;
data.forEach(profile => {
    if (profile.data.fullName == "fs0ci3ty") {
        count++;
        console.log(profile.data.username);
    }
});

console.log(count);