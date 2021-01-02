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

function asAlphabeticalFields(sounds) {
  let arr = [];
  for (const sound in sounds) {
    const { url, volume } = sounds[sound];
    arr = [
      ...arr,
      {
        name: `${sound} @ ${volume}%`,
        value: url,
        inline: true
      }
    ];
  }
  return alphabetize(arr, "name");
}

class ListSoundsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list-sounds",
      aliases: ["ls"],
      group: "soundboard",
      memberName: "list-sounds",
      description: "List all sounds in the guild's soundboard.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;

    const sounds = await this.client.provider.get(guildId, "sounds", {});
    const embedFields = asAlphabeticalFields(sounds);

    let currentIndex = 0;

    let embedSlice = embedFields.slice(currentIndex, currentIndex + 9);
    const temp = await msg.channel.send({
      content: "",
      embed: new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Sounds")
        .addFields(embedFields.slice(currentIndex, currentIndex + 9))
        .setFooter(
          `${currentIndex}-${currentIndex + embedSlice.length} of ${
            embedFields.length
          }`
        )
    });

    await temp.react("➡️");

    const collector = temp.createReactionCollector(
      (reaction, user) =>
        ["⬅️", "➡️"].includes(reaction.emoji.name) &&
        user.id !== this.client.user.id,
      { time: 60000 }
    );

    collector.on("collect", async reaction => {
      await temp.reactions.removeAll();

      if (reaction.emoji.name === "⬅️") {
        currentIndex -= 9;
      }

      if (reaction.emoji.name === "➡️") {
        currentIndex += 9;
      }

      embedSlice = embedFields.slice(currentIndex, currentIndex + 9);

      temp.edit({
        content: "",
        embed: new MessageEmbed()
          .setColor("#0099ff")
          .setTitle("Sounds")
          .addFields(embedSlice)
          .setFooter(
            `${currentIndex}-${currentIndex + embedSlice.length} of ${
              embedFields.length
            }`
          )
      });

      if (currentIndex > 0) {
        await temp.react("⬅️");
      }

      if (currentIndex + 9 < embedFields.length) {
        await temp.react("➡️");
      }
    });
  }
}

module.exports = ListSoundsCommand;
