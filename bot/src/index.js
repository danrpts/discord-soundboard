const path = require("path");
const Keyv = require("keyv");
const Queue = require("bee-queue");
const KeyvProvider = require("commando-provider-keyv");
const { Client } = require("discord.js-commando");

const { Sound, Greeting } = require("./models");

const client = new Client({
  commandPrefix: "!",
  owner: process.env.DISCORD_OWNER_ID
});

client.setProvider(
  new KeyvProvider(
    new Keyv(process.env.DATABASE_URL, {
      table: "settings",
      namespace: "guildId"
    })
  )
);

const soundQueue = new Queue("sounds", {
  redis: {
    host: process.env.REDIS_HOST
  }
});

if (process.env.NODE_ENV !== "production") {
  client.on("debug", console.info);
}

client.on("error", console.error);

client.on("ready", () => {
  console.log(
    `${client.user.username}#${client.user.discriminator} (${client.user.id}) ready.`
  );

  soundQueue.process(async job => {
    console.log(job.data);

    const guild = await client.guilds.fetch(job.data.guildId);
    const member = await guild.members.fetch(job.data.memberId);
    console.log(!!member);
    const connection = await member.voice.channel.join();
    console.log(!!connection);
    await connection.voice.setSelfDeaf(true);

    const dispatcher = connection.play(job.data.url, {
      quality: "highestaudio",
      volume: job.data.volume / 100
    });

    return new Promise(resolve => {
      dispatcher.on("finish", () => resolve());
    });
  });
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const oldChannelId = oldState.channelID;
  const newChannelId = newState.channelID;

  // user joined voice channel
  if (!oldChannelId && newChannelId) {
    const guildId = newState.guild.id;
    const userId = newState.member.user.toString();

    const greeting = await Greeting.findOne({
      where: { guild_id: guildId, user_id: userId },
      include: Sound
    });

    if (!greeting) {
      return;
    }

    const volume = greeting.volume || greeting.Sound.volume;

    await soundQueue
      .createJob({
        guildId,
        memberId: newState.member.id,
        url: greeting.Sound.url,
        volume
      })
      .save();
  }
});

client.registry
  .registerDefaults()
  .registerGroups([["soundboard", "Soundboard Commands"]])
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login();
