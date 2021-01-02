const { Command } = require("discord.js-commando");

class RenameSoundCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rename-sound",
      aliases: ["ms"],
      group: "soundboard",
      memberName: "rename-sound",
      description: "Rename a sounds from the guild's soundboard.",
      guildOnly: true,
      examples: [`${client.commandPrefix}rs flute`],
      args: [
        {
          key: "oldSound",
          prompt: "What sound would you like to rename?",
          type: "string"
        },
        {
          key: "newSound",
          prompt: "What would you like the new name to be?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const sounds = await this.client.provider.get(guildId, "sounds", {});

    if (!sounds[args.oldSound.toLowerCase()]) {
      await msg.reply("that sounds does not exist.");
      return;
    }

    await this.client.provider.set(guildId, "sounds", {
      ...sounds,
      [args.oldSound.toLowerCase()]: undefined,
      [args.newSound.toLowerCase()]: sounds[args.oldSound.toLowerCase()]
    });

    await msg.react("👍");
  }
}

module.exports = RenameSoundCommand;
