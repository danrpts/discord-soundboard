const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

function alphabetize(arr, key) {
  return arr.sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      return 0;
    }
  });
}

function asAlphabeticalFields(greetings) {
  let arr = [];
  for (const user in greetings) {
    const { sound, volume } = greetings[user];
    arr = [
      ...arr,
      {
        name: `${sound} @ ${volume}%`,
        value: user,
        inline: true
      }
    ];
  }

  return alphabetize(arr, "name");
}

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

    const embedFields = asAlphabeticalFields(greetings);

    await msg.channel.send({
      content: "",
      embed: new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Greetings")
        .addFields(embedFields)
    });
  }
}

module.exports = ListGreetingsCommand;
