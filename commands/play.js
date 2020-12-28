async function handler({ aliases, message, argv }) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  const connection = await voiceChannel.join();
  await connection.voice.setSelfDeaf(true);

  const guildAliases = (await aliases.get(message.guild.id)) || {};

  // circular refs creates undesired behavior in below logic

  let name = guildAliases[argv.name] || argv.name;

  if (argv.alias) {
    await aliases.set(message.guild.id, {
      ...guildAliases,
      [argv.alias]: argv.name
    });
  }

  if (argv.original) {
    name = argv.name;
  }

  const url = `https://www.myinstants.com/media/sounds/${name}.mp3`;

  const dispatcher = connection.play(url, {
    quality: "highestaudio",
    volume: false
  });

  dispatcher.on("start", () => {
    message.react("👍");
  });
}

module.exports = {
  command: "!play <name>",
  describe:
    "Play an mp3 sourced from `https://www.myinstants.com` over voice channel",
  builder: {
    a: {
      alias: "alias",
      describe: "Set a quick alias for the mp3",
      type: "string"
    },
    o: {
      alias: "original",
      describe: "Ignore the alias and play the original mp3",
      type: "boolean"
    }
  },
  handler
};
