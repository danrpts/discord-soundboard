async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  try {
    const connection = await voiceChannel.join();
    await connection.voice.setSelfDeaf(true);

    const name = args.length ? args.join("-").toLowerCase() : "titanic-flute";

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
  }
}

module.exports = {
  name: "!play",
  execute
};
