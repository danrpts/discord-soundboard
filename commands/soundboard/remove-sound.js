const { Command } = require("discord.js-commando");

class RemoveSoundCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remove-sound",
      aliases: ["rs"],
      group: "soundboard",
      memberName: "remove-sound",
      description: "Removes a sounds from the guild's soundboard.",
      guildOnly: true,
      examples: [`${client.commandPrefix}rs flute`],
      args: [
        {
          key: "sound",
          prompt: "What sounds would you like to remove?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const sounds = await this.client.provider.get(guildId, "sounds", {});
    await this.client.provider.set(guildId, "sounds", {
      ...sounds,
      [args.sound]: undefined
    });

    await msg.react("👍");
  }
}

module.exports = RemoveSoundCommand;
