const { Command } = require("discord.js-commando");

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p"],
      group: "soundboard",
      memberName: "play",
      description: `Plays a sound over your current voice channel. If the sound exists on ${process.env.MP3_HOST} I will reply with 👍.`,
      guildOnly: true,
      examples: [`${client.commandPrefix}p flute`],
      args: [
        {
          key: "sound",
          prompt: "What sound would you like to play?",
          type: "string"
        },
        {
          key: "volume",
          prompt: "What % volume would you like play the sound at?",
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
    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) {
      return msg.reply("join a voice channel to play that sound.");
    }

    const connection = await voiceChannel.join();
    await connection.voice.setSelfDeaf(true);

    const sounds = await this.client.provider.get(guildId, "sounds", {});
    const sound = sounds[args.sound.toLowerCase()];

    if (!sound) {
      await msg.reply("that sounds does not exist.");
      return;
    }

    const volume = Math.floor(args.volume) || sound.volume;
    console.log(`playing ${args.sound} (${sound.url}) ${volume}%`);
    const dispatcher = connection.play(sound.url, {
      quality: "highestaudio",
      volume: volume / 100
    });

    dispatcher.on("start", async () => msg.react("👍"));
  }
}

module.exports = PlayCommand;
