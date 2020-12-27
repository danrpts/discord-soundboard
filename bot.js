require("dotenv").config();

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(name => name.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("message", handleMessage);

async function handleMessage(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  const [command, ...args] = message.content.trim().split(/\s+/);
  if (!client.commands.has(command)) return;

  try {
    await client.commands.get(command).execute(message, args);
  } catch (e) {
    // todo: handle exeptions
  }
}

client.login();
