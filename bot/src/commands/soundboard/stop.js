const { Command } = require("discord.js-commando");

class StopCommand extends Command {
  constructor(client) {
    super(client, {
      name: "stop",
      aliases: ["s", "next"],
      group: "soundboard",
      memberName: "stop",
      description: "Stop the current playing sounds.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    // await stopQueue
    //   .createJob({
    //     guildId,
    //     memberId: msg.member.id
    //   })
    //   .save();
  }
}

module.exports = StopCommand;
