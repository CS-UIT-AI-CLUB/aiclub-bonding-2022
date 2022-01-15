const fs = require("fs-extra");

team_amount = 20;

for (var team_cnt = 1; team_cnt <= team_amount; team_cnt++) {
    var team_id = "team" + String(team_cnt).padStart(2, '0');
    var filepath = `./challenge-data/team-data/${team_id}.json`;
    var obj = {
        "team_id": team_id,
        "team_member_id": [],
        "current_challenge": 0,
        "team_attempt_count": 0,
        "usedHints": 0,
        "team_timestamps": []
    }
    fs.writeJSONSync(filepath, obj);
    console.log(`Done ${team_id}`);
}
