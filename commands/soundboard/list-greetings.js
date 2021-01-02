const { Command } = require("discord.js-commando");

class ListGreetingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list-greetings",
      aliases: ["lg"],
      group: "soundboard",
      memberName: "list-greetings",
      description: "List all greetings in the guild's soundboard.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const greetings = await this.client.provider.get(guildId, "greetings", {});

    let fields = [];
    for (const user in greetings) {
      const { sound, volume } = greetings[user];
      fields = [
        ...fields,
        {
          name: `${sound} @ ${volume}%`,
          value: user,
          inline: true
        }
      ];
    }

    msg.reply({
      content: "greetings: ",
      embed: {
        fields: fields
      }
    });
  }
}

module.exports = ListGreetingsCommand;
