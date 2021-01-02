const { Command } = require("discord.js-commando");

class AddCommand extends Command {
  constructor(client) {
    super(client, {
      name: "sound",
      aliases: ["s"],
      group: "soundboard",
      memberName: "add",
      description: `Add a sound to the guild's soundboard. I'll reply with 👍 once I've jotted it down.`,
      guildOnly: true,
      examples: [
        `${client.commandPrefix}s flute https://www.myinstants.com/media/sounds/titanic-flute.mp3`
      ],
      args: [
        {
          key: "sound",
          prompt: "What would you like to call this sound?",
          type: "string"
        },
        {
          key: "url",
          prompt: "What is the full URL to the mp3 file?",
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
    await this.client.provider.set(guildId, "sounds", {
      ...sounds,
      [args.sound]: {
        url: args.url,
        volume: Math.floor(args.volume)
      }
    });

    await msg.react("👍");
  }
}

module.exports = AddCommand;
