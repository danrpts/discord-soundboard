async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;

  try {
    // todo
  } catch (e) {
    // todo: handle exeptions
    console.error(e);
  }
}

module.exports = {
  name: "!alias",
  execute
};
