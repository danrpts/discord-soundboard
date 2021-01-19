const Redis = require("ioredis");
const Redlock = require("redlock");

class Player {
  constructor(channel, guildId) {
    this.channel = channel;
    this.guildId = guildId;
    this.client = new Redis({
      host: process.env.REDIS_HOST
    });
    this.redlock = new Redlock([this.client]);
    this.listKey = `${this.guildId}:list`;
    this.lockKey + `${this.guildId}:lock`;
  }

  async start() {
    try {
      const lock = await this.redlock.lock(this.lockKey, 5000);

      const subscriber = new Redis({
        host: process.env.REDIS_HOST
      });
      subscriber.subscribe(this.guildId);
      subscriber.on("message", async (channel, message) => {
        console.info("[STREAMER] received:", message);
        switch (message) {
          case "stop":
            if (this.dispatcher) {
              this.dispatcher.end();
            }
            break;
        }
      });

      console.info("[STREAMER] up:", this.guildId);
      const connection = await this.channel.join();
      await connection.voice.setSelfDeaf(true);

      let payload;
      while ((payload = await this.client.lpop(this.listKey))) {
        const sound = JSON.parse(payload);
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
      }

      await lock.unlock();
      console.info("[STREAMER] down:", this.guildId);
    } catch (err) {
      // todo standby
    }
  }

  async unshift({ url, name, volume }) {
    await this.client.lpush(
      this.listKey,
      JSON.stringify({ url, name, volume })
    );

    await this.client.publish(this.guildId, "stop");

    this.start();
  }

  async enqueue({ url, name, volume }) {
    await this.client.rpush(
      this.listKey,
      JSON.stringify({ url, name, volume })
    );

    this.start();
  }

  async skip() {
    await this.client.publish(this.guildId, "stop");
  }

  async clear() {
    await this.client.del(this.listKey);
    await this.client.publish(this.guildId, "stop");
  }

  async list() {
    return this.client.lrange(this.listKey, 0, -1);
  }
}

module.exports = Player;
