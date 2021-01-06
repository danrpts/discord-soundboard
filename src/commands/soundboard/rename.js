const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");

class RenameSoundCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rename",
      aliases: ["mv", "move"],
      group: "soundboard",
      memberName: "rename",
      description: "Rename a sound on your guild's soundboard.",
      guildOnly: true,
      examples: [`${client.commandPrefix}rename flute star-flute`],
      args: [
        {
          key: "oldName",
          prompt: "What sound would you like to rename?",
          type: "string"
        },
        {
          key: "newName",
          prompt: "What would you like to rename it?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const oldName = args.oldName.toLowerCase();
    const newName = args.newName.toLowerCase();

    const updatedSounds = await Sound.update(
      { name: newName },
      {
        where: { guild_id: guildId, name: oldName },
        limit: 1
      }
    );

    if (updatedSounds[0] < 1) {
      return msg.reply("that sounds does not exist.");
    }

    await msg.react("👍");
  }
}

module.exports = RenameSoundCommand;
