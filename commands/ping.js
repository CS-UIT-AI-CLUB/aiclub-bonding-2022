module.exports = {
	name: 'ping',
	description: 'Ping your network.',
	execute(message, client) {
        message.channel.send("Pinging...").then(m =>{
            var ping = m.createdTimestamp - message.createdTimestamp;
            m.edit(`**:ping_pong: Pong! Your Ping Is:-**\n  ${ping}ms`);
        });
	}
};