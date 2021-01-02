const { Command } = require("discord.js-commando");

class RemoveGreetingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remove-greeting",
      aliases: ["rg"],
      group: "soundboard",
      memberName: "remove-greeting",
      description: "Removes a greeting from the guild's soundboard.",
      guildOnly: true,
      examples: [`${client.commandPrefix}rg \`@danny\``],
      args: [
        {
          key: "user",
          prompt: "Who's greetings would you like remove?",
          type: "user"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const greetings = await this.client.provider.get(guildId, "greetings", {});
    await this.client.provider.set(guildId, "greetings", {
      ...greetings,
      [args.user]: undefined
    });

    await msg.react("👍");
  }
}

module.exports = RemoveGreetingCommand;
