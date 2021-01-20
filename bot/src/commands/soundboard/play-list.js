const { Command } = require("discord.js-commando");

const Queue = require("../../Queue.js");
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
    const queue = new Queue(msg, guildId);
    const list = await queue.list();
    await msg.reply(list);
  }
}

module.exports = PlayListCommand;
