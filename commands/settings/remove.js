const { get } = require("lodash");
const { Command } = require("discord.js-commando");

class PrintCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rm",
      aliases: ["remove"],
      group: "settings",
      memberName: "remove",
      description: "Removes a setting from the provided group.",
      guildOnly: true,
      examples: [
        `${client.commandPrefix}print aliases`,
        `${client.commandPrefix}print greetings`
      ],
      args: [
        {
          key: "group",
          prompt: "What settings group would you like?",
          oneOf: ["aliases", "greetings"],
          type: "string"
        },
        {
          key: "key",
          prompt: "What setting would you like to remove?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const group = await this.client.provider.get(guildId, args.group, {});

    await this.client.provider.set(guildId, args.group, {
      ...group,
      [args.key]: undefined
    });

    await msg.react("👍");
  }
}

module.exports = PrintCommand;
