const { Command } = require("discord.js-commando");

const Queue = require("../../queue.js");

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
    const queue = new Queue(msg, guildId);
    await queue.clear();
    await msg.react("👍");
  }
}

module.exports = ClearCommand;
