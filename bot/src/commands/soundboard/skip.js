const { Command } = require("discord.js-commando");
const Queue = require("../../queue.js");

class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      aliases: ["s"],
      group: "soundboard",
      memberName: "skip",
      description: "Skip the current playing sound.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const queue = new Queue(msg, guildId);
    await queue.skip();
    await msg.react("👍");
  }
}

module.exports = SkipCommand;
