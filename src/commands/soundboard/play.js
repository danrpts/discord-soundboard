const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p"],
      group: "soundboard",
      memberName: "play",
      description: `Plays a sound over your current voice channel.`,
      guildOnly: true,
      examples: [`${client.commandPrefix}play flute`],
      args: [
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
    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) {
      return msg.reply("please join a voice channel to play that sound.");
    }

    const connection = await voiceChannel.join();
    await connection.voice.setSelfDeaf(true);

    const sound = await Sound.findOne({
      where: { guild_id: guildId, name: args.name.toLowerCase() }
    });

    if (!sound) {
      return msg.reply("that sounds does not exist.");
    }

    const volume = Math.floor(args.volume) || sound.volume;

    console.log(`playing ${sound.name} (${sound.url}) ${volume}%`);

    const dispatcher = connection.play(sound.url, {
      quality: "highestaudio",
      volume: volume / 100
    });

    dispatcher.on("start", async () => msg.react("👍"));
  }
}

module.exports = PlayCommand;
