const { Command } = require("discord.js-commando");
const { skip } = require("../../queue.js");

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
    const channel = msg.member.voice.channel;

    if (!channel) {
      return msg.reply("please join a voice channel to skip current sound.");
    }

    await skip(channel);
    await msg.react("👍");
  }
}

module.exports = SkipCommand;
