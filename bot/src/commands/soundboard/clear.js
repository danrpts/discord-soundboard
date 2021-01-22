const { Command } = require("discord.js-commando");

const { clear } = require("../../queue.js");

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
    const channel = msg.member.voice.channel;
    if (!channel) {
      return msg.reply("please join a voice channel to clear the queue.");
    }
    await clear(channel);
    await msg.react("👍");
  }
}

module.exports = ClearCommand;
