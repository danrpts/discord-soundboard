require("dotenv").config();

const path = require("path");
const Keyv = require("keyv");
const KeyvProvider = require("commando-provider-keyv");
const { Sound, Greeting } = require("./models");

const { Client } = require("discord.js-commando");

const client = new Client({
  owner: process.env.OWNER_ID,
  commandPrefix: process.env.COMMAND_PREFIX
});

client.setProvider(
  new KeyvProvider(
    new Keyv(process.env.DATABASE_URL, {
      namespace: "settings"
    })
  )
);

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

    const greeting = await Greeting.findOne({
      where: { guild_id: guildId, user_id: user.toString() }
    });

    if (greeting) {
      const connection = await newState.channel.join();
      await newState.setSelfDeaf(true);

      // todo: association
      const sound = await Sound.findOne({
        where: { guild_id: guildId, name: greeting.name }
      });

      if (!sound) {
        return;
      }

      const volume = greeting.volume || sound.volume;

      console.log(`playing ${sound.name} (${sound.url}) ${volume}%`);

      connection.play(sound.url, {
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
