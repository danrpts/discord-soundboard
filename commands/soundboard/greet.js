const { get } = require("lodash");
const { Command } = require("discord.js-commando");

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "greeting",
      aliases: ["greet"],
      group: "soundboard",
      memberName: "greeting",
      description:
        "Greet the user you mention with a sound when entering the voice channel. I will reply with 👍 once I have jotted down the greeting.",
      guildOnly: true,
      examples: [
        `${client.commandPrefix}greet \`@danny\` trumpet`,
        `${client.commandPrefix}greet \`@danny\` mlg-airhorn confirm`
      ],
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
          key: "confirm",
          prompt: "Would you like to confirm the sound and and play it now?",
          default: "",
          oneOf: ["confirm"],
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const aliases = await this.client.provider.get(guildId, "aliases", {});
    const sound = aliases[args.sound] || args.sound;
    const greetings = await this.client.provider.get(guildId, "greetings", {});
    await this.client.provider.set(guildId, "greetings", {
      ...greetings,
      [args.user.id]: sound
    });

    if (args.confirm) {
      const voiceChannel = msg.member.voice.channel;
      if (voiceChannel) {
        const connection = await voiceChannel.join();
        await connection.voice.setSelfDeaf(true);
        const url = `${process.env.MP3_HOST}/${sound}.mp3`;
        connection.play(url, {
          quality: "highestaudio",
          volume: false
        });
      }
    }

    await msg.react("👍");
  }
}

module.exports = PlayCommand;
