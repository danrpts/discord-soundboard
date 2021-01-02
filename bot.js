require("dotenv").config();

const path = require("path");
const Keyv = require("keyv");
const KeyvProvider = require("commando-provider-keyv");

const { Client } = require("discord.js-commando");

const client = new Client({
  owner: process.env.OWNER_ID,
  commandPrefix: process.env.COMMAND_PREFIX
});

client.setProvider(new KeyvProvider(new Keyv(process.env.DATABASE_URL)));

if (process.env.DEBUG) {
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
    const user = newState.member.user;

    const sounds = await client.provider.get(guildId, "sounds", {});
    const greetings = await client.provider.get(
      newState.guild.id,
      "greetings",
      {}
    );

    const connection = await newState.channel.join();
    await newState.setSelfDeaf(true);
    const greeting = greetings[user];

    if (greeting) {
      const sound = sounds[greeting.sound];

      if (!sound) {
        return;
      }

      console.log(
        `playing ${greeting.sound} (${sound.url}) ${greeting.volume}%`
      );
      connection.play(sound.url, {
        quality: "highestaudio",
        volume: greeting.volume / 100
      });
    }
  }
});

client.registry
  .registerDefaults()
  .registerGroups([["soundboard", "Soundboard Commands"]])
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login();
