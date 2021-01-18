const Redis = require("ioredis");
const { inspect } = require("util");

class Player {
  constructor(msg, guildId) {
    this.msg = msg;
    this.guildId = guildId;
    this.client = new Redis({
      host: process.env.REDIS_HOST
    });
  }

  async play({ url, name, volume }) {
    const length = await this.client.rpush(
      this.guildId,
      JSON.stringify({ url, name, volume })
    );

    await this.msg.react("👍");

    // todo: use an expiring redlock
    if (length === 1) {
      try {
        const subscriber = new Redis({
          host: process.env.REDIS_HOST
        });
        subscriber.subscribe(this.guildId);
        subscriber.on("message", (channel, message) => {
          switch (message) {
            case "skip":
              console.info("[STREAMER] received:", message);
              if (this.dispatcher) {
                this.dispatcher.end();
              }
              break;
          }
        });

        console.info("[STREAMER] up:", this.guildId);
        const connection = await this.msg.member.voice.channel.join();
        await connection.voice.setSelfDeaf(true);

        while ((await this.client.llen(this.guildId)) > 0) {
          const sound = JSON.parse(await this.client.lindex(this.guildId, 0));

          console.info("[STREAMER] processing:", this.guildId, sound);

          this.dispatcher = connection.play(sound.url, {
            volume: sound.volume,
            quality: "highestaudio"
          });

          await new Promise((resolve, reject) => {
            this.dispatcher.on("finish", () => resolve());
            this.dispatcher.on("error", () => reject());
          });

          await this.client.lpop(this.guildId);
        }

        console.info("[STREAMER] down:", this.guildId);
      } catch (err) {
        // streamer errored with list full, must unblock next stream
        await this.client.del(this.guildId);
        console.info("[STREAMER] errored:", this.guildId, err);
      }
    }
  }

  async skip() {
    await this.client.publish(this.guildId, "skip");
    await this.msg.react("👍");
  }

  async clear() {
    await this.client.del(this.guildId);
    await this.client.publish(this.guildId, "skip");
    await this.msg.react("👍");
  }

  async list() {
    const list = await this.client.lrange(this.guildId, 0, -1);
    await this.msg.reply(
      JSON.stringify(list.map(payload => JSON.parse(payload).name))
    );
  }
}

module.exports = Player;
