const { DEAFULT_ALIASES } = require("../constants");

async function handler({ message, argv }) {
  if (argv.delete && global.aliases[message.guild.id][argv.alias]) {
    delete global.aliases[message.guild.id][argv.alias];
    return message.react("👍");
  }

  if (argv.clear) {
    global.aliases[message.guild.id] = {};
    return message.react("👍");
  }

  if (argv.reset) {
    global.aliases[message.guild.id] = { ...DEAFULT_ALIASES };
  }

  const list = JSON.stringify(
    global.aliases[message.guild.id],
    undefined,
    2
  ).replace(/[\{\}\"]/g, "");

  return message.reply(list);
}

module.exports = {
  command: "!list [alias]",
  describe: "Show current mp3 alias list for guild",
  builder: {
    c: {
      alias: "clear",
      describe: "Clear the alias list",
      type: "boolean"
    },
    d: {
      alias: "delete",
      describe: "Delete [alias] from the list",
      type: "string"
    },
    r: {
      alias: "reset",
      describe: "Reset the alias list to default",
      type: "boolean"
    }
  },
  handler
};
