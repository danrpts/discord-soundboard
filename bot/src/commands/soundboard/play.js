const { Command } = require("discord.js-commando");

const Player = require("../../player.js");
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
    const channel = msg.member.voice.channel;

    if (!channel) {
      return msg.reply("please join a voice channel to play that sound.");
    }

    const sound = await Sound.findOne({
      where: { guild_id: guildId, name: args.name.toLowerCase() }
    });

    if (!sound) {
      return msg.reply("that sounds does not exist.");
    }

    const volume = (Math.floor(args.volume) || sound.volume) / 100;

    const player = new Player(channel, guildId);
    await player.enqueue({
      url: sound.url,
      name: sound.name,
      volume
    });
    await msg.react("👍");
  }
}

module.exports = PlayCommand;
