const fs = require("fs-extra");

team_amount = 20;
game1_maxValue = 9;

function getPerm() {
    var permArray = new Array(game1_maxValue);
    for(var i = 0; i < game1_maxValue; i++){
        permArray[i] = i;
    }
    // draw out of the number sequence
    for (var i = (game1_maxValue - 1); i >= 0; --i){
        var randPos = Math.floor(i * Math.random());
        var tmpStore = permArray[i];
        permArray[i] = permArray[randPos];
        permArray[randPos] = tmpStore;
    }
    var resStr = "";
    for (var i = 0; i < game1_maxValue; i++) {
        permArray[i]++;
        resStr += permArray[i].toString();
    }
    return resStr;
}
for (var team_cnt = 1; team_cnt <= team_amount; team_cnt++) {
    var team_id = "team" + String(team_cnt).padStart(2, '0');
    var filepath = `./challenge-data/game1-data/${team_id}.json`;
    var obj = {"resStr": getPerm()}
    fs.writeJSONSync(filepath, obj);
    console.log(`Done ${team_id}`);
}
