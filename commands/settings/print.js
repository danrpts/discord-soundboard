const { get } = require("lodash");
const { Command } = require("discord.js-commando");

class PrintCommand extends Command {
  constructor(client) {
    super(client, {
      name: "print",
      group: "settings",
      memberName: "print",
      description: "Prints a group of soundboard settings.",
      guildOnly: true,
      examples: [
        `${client.commandPrefix}print aliases`,
        `${client.commandPrefix}print greetings`
      ],
      args: [
        {
          key: "group",
          prompt: "What settings group would you like to print?",
          oneOf: ["aliases", "greetings"],
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const group = await this.client.provider.get(guildId, args.group, {});

    if (Object.keys(group).length < 1) {
      msg.reply(`${args.group} is empty.`);
    } else {
      msg.reply(`\n${JSON.stringify(group, undefined, 2)}`);
    }
  }
}

module.exports = PrintCommand;
