const Redis = require("ioredis");
const Redlock = require("redlock");

class Player {
  constructor(msg, guildId) {
    this.msg = msg;
    this.guildId = guildId;
    this.client = new Redis({
      host: process.env.REDIS_HOST
    });
    this.redlock = new Redlock([this.client]);
    this.listKey = `${this.guildId}:list`;
    this.lockKey + `${this.guildId}:lock`;
  }

  async play({ url, name, volume }) {
    const length = await this.client.rpush(
      this.listKey,
      JSON.stringify({ url, name, volume })
    );

    await this.msg.react("👍");

    try {
      const lock = await this.redlock.lock(this.lockKey, 5000);

      const subscriber = new Redis({
        host: process.env.REDIS_HOST
      });
      subscriber.subscribe(this.guildId);
      subscriber.on("message", async (channel, message) => {
        console.info("[STREAMER] received:", message);
        switch (message) {
          case "skip":
            this.dispatcher.end();
            break;
          case "clear":
            this.dispatcher.end();
            await this.client.del(this.listKey);
            await lock.unlock();
            break;
        }
      });

      console.info("[STREAMER] up:", this.guildId);
      const connection = await this.msg.member.voice.channel.join();
      await connection.voice.setSelfDeaf(true);

      while ((await this.client.llen(this.listKey)) > 0) {
        const sound = JSON.parse(await this.client.lindex(this.listKey, 0));

        console.info("[STREAMER] processing:", this.guildId, sound);

        this.dispatcher = connection.play(sound.url, {
          volume: sound.volume,
          quality: "highestaudio"
        });

        this.dispatcher.on("drain", async () => {
          try {
            // todo: extend lock with dynamic value
            await lock.extend(lock.expiration - Date.now() + 50);
          } catch (err) {
            console.info("[STREAMER] extend lock error:", this.guildId, err);
          }
        });

        await new Promise((resolve, reject) => {
          this.dispatcher.on("finish", () => resolve());
          this.dispatcher.on("error", () => reject());
        });

        await this.client.lpop(this.listKey);
      }

      await lock.unlock();
      console.info("[STREAMER] down:", this.guildId);
    } catch (err) {
      // todo standby
    }
  }

  async skip() {
    await this.client.publish(this.guildId, "skip");
    await this.msg.react("👍");
  }

  async clear() {
    await this.client.publish(this.guildId, "clear");
    await this.msg.react("👍");
  }

  async list() {
    const list = await this.client.lrange(this.listKey, 0, -1);
    await this.msg.reply(
      JSON.stringify(list.map(payload => JSON.parse(payload).name))
    );
  }
}

module.exports = Player;
