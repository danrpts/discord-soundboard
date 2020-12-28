require("dotenv").config();

const path = require("path");
const yargs = require("yargs");
const Discord = require("discord.js");
const client = new Discord.Client();

const { DEAFULT_ALIASES } = require("./constants");

async function handler(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  // todo: use redis or pg
  global.aliases = global.aliases || {};
  global.aliases[message.guild.id] = global.aliases[message.guild.id] || {
    ...DEAFULT_ALIASES
  };

  try {
    yargs
      .middleware(argv => ({ message, argv }))
      .help()
      .commandDir("commands")
      .version(false)
      .parse(message.content, (error, argv, output) => {
        if (error || argv.help || argv.version) {
          const filename = path.basename(__filename);
          const usage = output.replace(new RegExp(filename, "gi"), "");
          message.reply(`\n${usage}`);
        }
      });
  } catch (e) {
    console.error(e);
  }
}

client.on("message", handler);
client.login();
