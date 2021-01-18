const { Command } = require("discord.js-commando");

const Player = require("../../player.js");

class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      group: "soundboard",
      memberName: "clear",
      description:
        "Stop the current playing sound and clear the remaining queued sounds.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const player = new Player(msg, guildId);
    return player.clear();
  }
}

module.exports = ClearCommand;
