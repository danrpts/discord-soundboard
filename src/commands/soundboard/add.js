const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");

class AddCommand extends Command {
  constructor(client) {
    super(client, {
      name: "add",
      aliases: ["a"],
      group: "soundboard",
      memberName: "add",
      description: `Add a sound to your guild's soundboard.`,
      guildOnly: true,
      examples: [
        `${client.commandPrefix}add flute https://www.myinstants.com/media/sounds/titanic-flute.mp3 75`
      ],
      args: [
        {
          key: "name",
          prompt: "What would you like to call the sound?",
          type: "string"
        },
        {
          key: "url",
          prompt: "What is the full URL to the mp3 file?",
          type: "string"
        },
        {
          key: "volume",
          prompt: "At what % volume would you like play that sound?",
          default: 50,
          max: 100,
          min: 0,
          type: "integer"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const creatorId = msg.author.toString();
    const name = args.name.toLowerCase();
    const url = args.url;

    const sound = await Sound.findOne({
      where: { guild_id: guildId, name: name }
    });

    if (sound) {
      return msg.reply(
        "that name is already taken, please remove or rename it you'd like to still use it."
      );
    }

    const volume = Math.floor(args.volume);

    await Sound.create({
      guild_id: guildId,
      creator_id: creatorId,
      name,
      url,
      volume
    });

    await msg.react("👍");
  }
}

module.exports = AddCommand;
