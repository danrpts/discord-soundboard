async function handler({ aliases, message, argv }) {
  let guildAliases = (await aliases.get(message.guild.id)) || {};

  if (argv.clear) {
    guildAliases = {};
    await aliases.clear(message.guild.id);
  } else if (guildAliases[argv.remove]) {
    delete guildAliases[argv.remove];
    await aliases.set(message.guild.id, guildAliases);
  }

  const isEmpty = Object.keys(guildAliases).length < 1;
  const table = JSON.stringify(guildAliases, undefined, 2);

  let response = "";
  if (argv.clear) {
    response =
      "alright I cleaned up all aliases. Use `play <name> -a <alias>` to add another.";
  } else if (argv.remove && !guildAliases[argv.remove]) {
    response = "that alias does not exist.";
  } else if (argv.remove && isEmpty) {
    response =
      "I removed the alias and noticed your guild no longer has any! Use `play <name> -a <alias>` to add one.";
  } else if (argv.remove && !isEmpty) {
    response = `no problem. Here's what I have now: \n${table}`;
  } else if (!argv.remove && isEmpty) {
    response =
      "your guild has no aliases yet. Use `play <name> -a <alias>` to get started!";
  } else {
    response = `Here's what I have for your guild: \n${table}`;
  }

  return message.reply(response);
}

module.exports = {
  command: "!list",
  describe: "Show the current mp3-alias list for your guild",
  builder: {
    c: {
      alias: "clear",
      describe: "Purge the entire alias list",
      type: "boolean"
    },
    r: {
      alias: "remove",
      describe: "Remove the supplied alias from the list",
      type: "string"
    }
  },
  handler
};
