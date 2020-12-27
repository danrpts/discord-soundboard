async function execute(message, args) {
  if (args.length !== 1) {
    message.reply("invalid syntax. !play <shortname|fullname>");
    return;
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  try {
    const connection = await voiceChannel.join();
    await connection.voice.setSelfDeaf(true);

    // const name = args.length ? args.join("-").toLowerCase() : "titanic-flute";

    const name = global.guildAliases[message.guild.id][args[0]] || args[0];

    const url = `https://www.myinstants.com/media/sounds/${name}.mp3`;

    const dispatcher = connection.play(url, {
      quality: "highestaudio",
      volume: false
    });

    dispatcher.on("start", () => {
      message.react("👍");
    });
  } catch (e) {
    // todo: handle exeptions
    console.error(e);
    throw e;
  }
}

module.exports = {
  name: "!play",
  execute
};
