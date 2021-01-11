const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");

class RemoveSoundCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remove",
      aliases: ["rm"],
      group: "soundboard",
      memberName: "remove",
      description: "Removes a sound from your server's soundboard.",
      guildOnly: true,
      examples: [`${client.commandPrefix}remove flute`],
      args: [
        {
          key: "name",
          prompt: "What sound would you like to remove?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const name = args.name.toLowerCase();

    const destroyedCount = await Sound.destroy({
      where: { guild_id: guildId, name },
      limit: 1
    });

    if (destroyedCount < 1) {
      return msg.reply("that sounds does not exist.");
    }

    await msg.react("👍");
  }
}

module.exports = RemoveSoundCommand;
