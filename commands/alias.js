async function execute(message, args) {
  if (args.length !== 2) {
    message.reply("invalid syntax. !alias <shortname> <fullname>");
    return;
  }

  try {
    global.guildAliases[message.guild.id][args[0]] = args[1];
    await require("./play.js").execute(message, [args[0]]);
  } catch (e) {
    // todo: handle exeptions
    console.error(e);
    throw e;
  }
}

module.exports = {
  name: "!alias",
  execute
};
