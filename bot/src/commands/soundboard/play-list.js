const { Command } = require("discord.js-commando");
const { list } = require("../../queue.js");
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
    const channel = msg.member.voice.channel;
    if (!channel) {
      return msg.reply("please join a voice channel to list its sound queue.");
    }
    await msg.reply(await list(channel));
  }
}

module.exports = PlayListCommand;
