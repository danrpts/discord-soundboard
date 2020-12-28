require("dotenv").config();

const path = require("path");
const yargs = require("yargs");
const Keyv = require("keyv");
const Discord = require("discord.js");

const aliases = new Keyv(process.env.URI, { namespace: "aliases" });
const client = new Discord.Client();

async function handler(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {
    yargs
      .middleware(argv => ({ aliases, message, argv }))
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

aliases.on("error", err =>
  console.error(`Keyv 'aliases' connection error: ${err}`)
);
client.on("message", handler);
client.on("error", err => console.error(`Discord connection error: ${err}`));
client.login();
