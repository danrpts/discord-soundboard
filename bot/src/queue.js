const Redis = require("ioredis");
const Redlock = require("redlock");
const EventEmitter = require("events");
const { isFunction } = require("lodash");

const client = new Redis({
  host: process.env.REDIS_HOST
});

const redlock = new Redlock([client]);

const subscriber = new Redis({
  host: process.env.REDIS_HOST
});

class Player extends EventEmitter {
  constructor(channel) {
    super();
    this.channel = channel;
  }

  async start({ url, name, volume }) {
    const connection = await this.channel.join();
    await connection.voice.setSelfDeaf(true);

    this.dispatcher = connection.play(url, {
      volume,
      quality: "highestaudio"
    });

    this.dispatcher.on("drain", () => {
      this.emit("drain");
    });

    await new Promise((resolve, reject) => {
      this.dispatcher.on("finish", () => resolve());
      this.dispatcher.on("error", () => reject());
    });
  }

  stop() {
    if (this.dispatcher) {
      this.dispatcher.end();
    }
  }
}

class Queue {
  constructor(channel, guildId) {
    this.channel = channel;
    this.guildId = guildId;
    this.listKey = `${this.guildId}:list`;
    this.lockKey = `${this.guildId}:lock`;
    this.playerKey = `${this.guildId}:player`;
  }

  async process() {
    try {
      const lock = await redlock.lock(this.lockKey, 5000);

      const player = new Player(this.channel);

      player.on("drain", () => {
        lock.extend(1000);
      });

      subscriber.on("message", (_, msg) => {
        if (isFunction(player[msg])) {
          player[msg]();
        }
      });

      subscriber.subscribe(this.playerKey);

      let payload;
      while ((payload = await client.lpop(this.listKey))) {
        const sound = JSON.parse(payload);
        await player.start(sound);
      }

      await lock.unlock();
    } catch (err) {
      console.error(err);
      // cannot lock
      // cannot extend lock
      // play errored
      // cannot unlock
      // misc
    }
  }

  async unshift(sound) {
    const payload = JSON.stringify(sound);
    await client.lpush(this.listKey, payload);
    this.process();
  }

  async enqueue(sound) {
    const payload = JSON.stringify(sound);
    await client.rpush(this.listKey, payload);
    this.process();
  }

  async skip() {
    await client.publish(this.playerKey, "stop");
  }

  async clear() {
    await client.del(this.listKey);
    await client.publish(this.playerKey, "stop");
  }

  async list() {
    return client.lrange(this.listKey, 0, -1);
  }
}

module.exports = Queue;
