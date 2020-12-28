async function handler({ message, argv }) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  const connection = await voiceChannel.join();
  await connection.voice.setSelfDeaf(true);

  if (argv.list) {
    for (let alias in global.aliases[message.guild.id]) {
      list[alias] = `\n${alias}: ${global.aliases[message.guild.id][alias]}`;
    }
    await message.reply(list);
    return;
  }

  let name = global.aliases[message.guild.id][argv.name] || argv.name;

  if (argv.alias) {
    global.aliases[message.guild.id][argv.alias] = argv.name;
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
    "Play mp3 <name> on voice channel from 'https://www.myinstants.com'",
  builder: {
    a: {
      alias: "alias",
      describe: "Set an alias for the mp3",
      type: "string"
    },
    o: {
      alias: "original",
      describe: "Play the original mp3",
      type: "boolean"
    }
  },
  handler
};
