const { Command } = require("discord.js-commando");
const { Greeting } = require("../../models");

class RemoveGreetingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remove-greeting",
      aliases: ["rg"],
      group: "soundboard",
      memberName: "remove-greeting",
      description: "Removes a greeting from your server's soundboard.",
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
    const userId = args.user.toString();

    const destroyedCount = await Greeting.destroy({
      where: { guild_id: guildId, user_id: userId },
      limit: 1
    });

    if (destroyedCount < 1) {
      return msg.reply("that greeting does not exist.");
    }

    await msg.react("👍");
  }
}

module.exports = RemoveGreetingCommand;
