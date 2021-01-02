const { Command } = require("discord.js-commando");

class AddGreetCommand extends Command {
  constructor(client) {
    super(client, {
      name: "add-greeting",
      aliases: ["greeting", "ag", "g"],
      group: "soundboard",
      memberName: "add-greeting",
      description:
        "Add a greeting for the mentioned user when entering the voice channel. I'll reply with 👍 once I've jotted it down.",
      guildOnly: true,
      examples: [`${client.commandPrefix}g \`@danny\` trumpet`],
      args: [
        {
          key: "user",
          prompt: "What user would you like to greet?",
          type: "user"
        },
        {
          key: "sound",
          prompt: "What sound would you like to play?",
          type: "string"
        },
        {
          key: "volume",
          prompt: "What % volume would you like play the sound at?",
          default: 75,
          max: 100,
          min: 0,
          type: "integer"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const sounds = await this.client.provider.get(guildId, "sounds", {});
    const sound = sounds[args.sound.toLowerCase()];
    if (!sound) {
      await msg.reply("that sounds does not exist.");
      return;
    }

    const greetings = await this.client.provider.get(guildId, "greetings", {});
    await this.client.provider.set(guildId, "greetings", {
      ...greetings,
      [args.user]: {
        sound: args.sound.toLowerCase(),
        volume: Math.floor(args.volume)
      }
    });

    await msg.react("👍");
  }
}

module.exports = AddGreetCommand;
