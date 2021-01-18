const { Command } = require("discord.js-commando");

const Player = require("../../player.js");
const { Sound } = require("../../models");

class PlayListCommand extends Command {
  constructor(client) {
    super(client, {
      name: "playlist",
      aliases: ["pl"],
      group: "soundboard",
      memberName: "playlist",
      description: `List all the queued sounds waiting to play.`,
      guildOnly: true,
      examples: [`${client.commandPrefix}playlist`]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const player = new Player(msg, guildId);
    return player.list();
  }
}

module.exports = PlayListCommand;
