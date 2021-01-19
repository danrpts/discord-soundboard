const { Command } = require("discord.js-commando");

const Player = require("../../player.js");

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

    const player = new Player(msg, guildId);
    await player.skip();
    await msg.react("👍");
  }
}

module.exports = SkipCommand;
