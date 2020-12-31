const { get } = require("lodash");
const { Command } = require("discord.js-commando");

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      group: "soundboard",
      memberName: "play",
      description: `Plays a sound over your current voice channel. If the sound exists on ${process.env.MP3_HOST} I will reply with 👍.`,
      guildOnly: true,
      examples: [
        `${client.commandPrefix}play bruh`,
        `${client.commandPrefix}play titanic-flute flute`
      ],
      args: [
        {
          key: "sound",
          prompt: "What sound would you like to play?",
          type: "string"
        },
        {
          key: "alias",
          prompt: "What would you like to alias this sound as?",
          default: "",
          type: "string"
        },
        {
          key: "mentions",
          prompt:
            "Who would you like to play the sound for when they join the voice channel?",
          default: [],
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) {
      return msg.reply("join a voice channel to play that sound.");
    }

    const connection = await voiceChannel.join();
    await connection.voice.setSelfDeaf(true);

    let aliases = await this.client.provider.get(guildId, "aliases", {});
    if (args.alias) {
      aliases = await this.client.provider.set(guildId, "aliases", {
        ...aliases,
        [args.alias]: args.sound
      });
    }

    const sound = aliases[args.sound] || args.sound;
    const url = `${process.env.MP3_HOST}/${sound}.mp3`;
    const dispatcher = connection.play(url, {
      quality: "highestaudio",
      volume: false
    });

    dispatcher.on("start", async () => msg.react("👍"));
  }
}

module.exports = PlayCommand;
