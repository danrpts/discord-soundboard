const path = require("path");
const Queue = require("bee-queue");
const { Client } = require("discord.js");

const client = new Client();

const queue = new Queue("sounds", {
  redis: {
    host: process.env.REDIS_HOST
  },
  worker: false
});

queue.process(async job => {
  console.log(job.data);

  const guild = await client.guilds.fetch(job.data.guildId);
  const member = await guild.members.fetch(job.data.memberId);

  const connection = await member.voice.channel.join();
  await connection.voice.setSelfDeaf(true);
  const volume = job.data.volume / 100;

  const dispatcher = connection.play(job.data.url, {
    volume,
    quality: "highestaudio"
  });

  return new Promise(resolve => {
    // todo handle errors
    dispatcher.on("finish", () => resolve());
  });
});

client.login();
