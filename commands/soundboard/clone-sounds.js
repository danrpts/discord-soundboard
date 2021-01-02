const { Command } = require("discord.js-commando");

class CloneSoundsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clone-sounds",
      aliases: ["cs"],
      group: "soundboard",
      memberName: "clone-sounds",
      description: "Clone sounds from one guild to another.",
      guildOnly: true,
      args: [
        {
          key: "guildId",
          prompt: "What guild would you like to clone from?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const sounds = await this.client.provider.get(args.guildId, "sounds", {});
    await this.client.provider.set(guildId, "sounds", sounds);
    await msg.react("👍");
  }
}

module.exports = CloneSoundsCommand;
