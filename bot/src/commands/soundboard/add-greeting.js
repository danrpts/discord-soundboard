const { Command } = require("discord.js-commando");
const { Sound, Greeting } = require("../../models");

class AddGreetingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "add-greeting",
      aliases: ["g"],
      group: "soundboard",
      memberName: "add-greeting",
      description:
        "Add a greeting for the @mentioned user when entering the voice channel.",
      guildOnly: true,
      examples: [`${client.commandPrefix}g \`@danny\` trumpet`],
      args: [
        {
          key: "user",
          prompt: "What user would you like to greet?",
          type: "user"
        },
        {
          key: "name",
          prompt: "What sound would you like to play?",
          type: "string"
        },
        {
          key: "volume",
          prompt: "At what % volume would you like play that sound?",
          default: "",
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
    const userId = args.user.toString();
    const name = args.name.toLowerCase();

    const sound = await Sound.findOne({
      where: { guild_id: guildId, name }
    });

    if (!sound) {
      return msg.reply("that sounds does not exist.");
    }

    const volume = args.volume ? Math.floor(args.volume) : sound.volume;

    await sound.createGreeting({
      guild_id: guildId,
      creator_id: creatorId,
      user_id: userId,
      volume
    });

    await msg.react("👍");
  }
}

module.exports = AddGreetingCommand;
