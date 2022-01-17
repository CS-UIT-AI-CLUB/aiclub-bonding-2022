const fs = require("fs-extra");

game_amount = 5;

for (var game_cnt = 1; game_cnt <= game_amount; game_cnt++) {
    var game_id = "game" + String(game_cnt).padStart(2, '0');
    var filepath = `./challenge-data/game-data/${game_id}.json`;
    var obj =  { "challenge_id": game_cnt,
    "challenge_title": `./challenge-data/statement-images/${game_cnt.toString()}.png`,
    "challenge_answer": "123",
    "challenge_hints": []}
    fs.writeJSONSync(filepath, obj);
    console.log(`Done ${game_id}`);
}