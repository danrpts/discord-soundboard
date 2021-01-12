const path = require("path");
const Queue = require("bee-queue");
const { Client } = require("discord.js-commando");

const { Sound, Greeting } = require("./models");

const client = new Client({
  commandPrefix: "!",
  owner: process.env.DISCORD_OWNER_ID
});

if (process.env.NODE_ENV !== "production") {
  client.on("debug", console.info);
}

client.on("error", console.error);

client.on("ready", () => {
  console.log(
    `${client.user.username}#${client.user.discriminator} (${client.user.id}) ready.`
  );
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

    const queue = new Queue("sounds", {
      redis: {
        host: process.env.REDIS_HOST
      },
      worker: false
    });

    const volume = greeting.volume || greeting.Sound.volume;

    await queue
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
