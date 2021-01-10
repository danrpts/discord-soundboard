const path = require("path");
const Keyv = require("keyv");
const KeyvProvider = require("commando-provider-keyv");
const { Sound, Greeting } = require("./models");

const { Client } = require("discord.js-commando");

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

    if (greeting) {
      const connection = await newState.channel.join();
      await newState.setSelfDeaf(true);

      const volume = greeting.volume || greeting.Sound.volume;

      console.log(
        `playing ${greeting.Sound.name} (${greeting.Sound.url}) ${volume}%`
      );

      connection.play(greeting.Sound.url, {
        quality: "highestaudio",
        volume: volume / 100
      });
    }
  }
});

client.registry
  .registerDefaults()
  .registerGroups([["soundboard", "Soundboard Commands"]])
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login();
