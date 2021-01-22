const Redis = require("ioredis");
const Redlock = require("redlock");

const queue = new Redis({
  host: process.env.REDIS_HOST
});

const redlock = new Redlock([queue]);

async function play(channel, sound) {
  await queue.rpush(channel.id, JSON.stringify(sound));

  try {
    const lock = await redlock.lock(`${channel.id}:lock`, 5000);

    const subscriber = new Redis({
      host: process.env.REDIS_HOST
    });

    const connection = await channel.join();
    await connection.voice.setSelfDeaf(true);

    let payload;
    while ((payload = await queue.lpop(channel.id))) {
      const { url, name, volume } = JSON.parse(payload);

      const dispatcher = connection.play(url, {
        volume,
        quality: "highestaudio"
      });

      dispatcher.on("drain", () => lock.extend(1000));

      subscriber.on("message", async (_, cmd) => {
        switch (cmd) {
          case "skip":
            dispatcher.end();
            break;
          case "clear":
            await queue.del(channel.id);
            dispatcher.end();
            break;
        }
      });

      subscriber.subscribe(channel.id);

      await new Promise((resolve, reject) =>
        dispatcher.on("finish", resolve).on("error", reject)
      );
    }

    subscriber.disconnect();
    connection.disconnect();
    await lock.unlock();
  } catch (err) {
    console.error(err);
  }
}

async function list(channel) {
  const list = await queue.lrange(channel.id, 0, -1);
  return list.map(payload => JSON.parse(payload).name);
}

function _publish(channel, cmd) {
  return queue.publish(channel.id, cmd);
}

const skip = channel => _publish(channel, "skip");
const clear = channel => _publish(channel, "clear");

module.exports = { play, list, skip, clear };
