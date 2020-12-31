require("dotenv").config();

const path = require("path");
const Keyv = require("keyv");
const KeyvProvider = require("commando-provider-keyv");

const { Client } = require("discord.js-commando");

const client = new Client({
  owner: process.env.OWNER_ID,
  commandPrefix: process.env.PREFIX
});

client.setProvider(new KeyvProvider(new Keyv(process.env.DATABASE_URL)));

if (process.env.DEBUG) {
  client.on("debug", console.info);
}

client.on("error", console.error);

client.on("ready", () => {
  console.log(
    `bot logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`
  );
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const oldChannelId = oldState.channelID;
  const newChannelId = newState.channelID;

  // user joined voice channel
  if (!oldChannelId && newChannelId) {
    const guildId = newState.guild.id;
    const guildAliases = await client.provider.get(guildId, "aliases", {});
    const guildGreetings = await client.provider.get(
      newState.guild.id,
      "greetings",
      {}
    );
    const connection = await newState.channel.join();
    await newState.setSelfDeaf(true);

    const greeting = guildGreetings[newState.member.user.id];
    const name = guildAliases[greeting] || greeting;
    const url = `${process.env.MP3_HOST}/${name}.mp3`;

    connection.play(url, {
      quality: "highestaudio",
      volume: 0.75
    });
  }
});

client.registry
  .registerDefaults()
  .registerGroups([
    ["soundboard", "Soundboard Commands"],
    ["settings", "Settings Commands"]
  ])
  .registerCommandsIn(path.join(__dirname, "commands"));

client.login();
