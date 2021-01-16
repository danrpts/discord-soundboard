const redis = require("redis");
const { Command } = require("discord.js-commando");
const { promisify } = require("util");

const { Sound } = require("../../models");

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST
});

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const del = promisify(redisClient.del).bind(redisClient);

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

    const sound = await Sound.findOne({
      where: { guild_id: guildId, name: args.name.toLowerCase() }
    });

    if (!sound) {
      return msg.reply("that sounds does not exist.");
    }

    const volume = (Math.floor(args.volume) || sound.volume) / 100;

    const isGuildPlaying = await get(guildId);

    if (isGuildPlaying) {
      const payload = JSON.stringify({
        url: sound.url,
        name: sound.name,
        volume
      });

      const publisher = redis.createClient({
        host: process.env.REDIS_HOST
      });

      publisher.publish(guildId, payload);

      publisher.quit();
    } else {
      const connection = await voiceChannel.join();
      await connection.voice.setSelfDeaf(true);

      this.queue = [
        {
          url: sound.url,
          name: sound.name,
          volume
        }
      ];

      const subscriber = redis.createClient({
        host: process.env.REDIS_HOST
      });

      subscriber.on("message", async (channel, payload) => {
        this.queue.push(JSON.parse(payload));
      });

      subscriber.subscribe(guildId);

      while (this.queue.length) {
        const data = this.queue.shift();

        await set(guildId, data.name);

        await msg.client.user.setPresence({
          activity: {
            type: "PLAYING",
            name: data.name,
            url: data.sound
          }
        });

        const dispatcher = connection.play(data.url, {
          volume: data.volume,
          quality: "highestaudio"
        });

        await new Promise(resolve => {
          dispatcher.on("finish", () => resolve());
        });

        await del(guildId);

        subscriber.quit();
      }

      await msg.client.user.setPresence({});
    }
  }
}

module.exports = PlayCommand;
