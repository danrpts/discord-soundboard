const colormap = require("colormap");
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const { Sound, Greeting } = require("../../models");
const { clamp } = require("lodash");

async function page({
  guildId,
  index,
  pageSize,
  pageCount,
  resultCount,
  color
}) {
  const greetings = await Greeting.findAll({
    limit: pageSize,
    offset: pageSize * index,
    where: { guild_id: guildId },
    include: Sound,
    order: [["Sound", "name", "ASC"]]
  });

  const fields = greetings.map(({ user_id, Sound, volume }) => ({
    name: `${Sound.name} @ ${volume}%`,
    value: user_id,
    inline: true
  }));

  const footer = `Page ${index + 1} / ${pageCount} • ${resultCount} results`;

  return new MessageEmbed()
    .setColor(color)
    .addFields(fields)
    .setFooter(footer);
}

class ListGreetingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list-greetings",
      aliases: ["lg"],
      group: "soundboard",
      memberName: "list-greetings",
      description: "List all greetings for your guild.",
      guildOnly: true
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const resultCount = await Greeting.count({
      where: { guild_id: guildId }
    });

    if (resultCount < 1) {
      return msg.reply("your guild's greetings are empty.");
    }

    let index = 0;
    const pageSize = 12;
    const pageCount = Math.ceil(resultCount / pageSize);

    const colors = colormap({
      colormap: "portland",
      nshades: clamp(pageCount, 5, Infinity),
      format: "hex",
      alpha: 1
    });

    const pageMsg = await msg.channel.send({
      embed: await page({
        guildId,
        index,
        pageSize,
        pageCount,
        resultCount,
        color: colors[index]
      })
    });

    if (pageCount > 1) {
      await Promise.all(["⏪", "◀️", "▶️", "⏩"].map(e => pageMsg.react(e)));

      const collector = await pageMsg.createReactionCollector(
        (reaction, user) => !user.bot,
        { time: 60000 }
      );

      collector.on("collect", async (reaction, user) => {
        // todo handle missing permissions
        switch (reaction.emoji.name) {
          case "⏪":
            index = 0;
            break;
          case "◀️":
            index -= 1;
            break;
          case "▶️":
            index += 1;
            break;
          case "⏩":
            index = pageCount - 1;
            break;
        }

        index = clamp(index, 0, pageCount - 1);
        await pageMsg.edit({
          embed: await page({
            guildId,
            index,
            pageSize,
            pageCount,
            resultCount,
            color: colors[index]
          })
        });

        // todo: alert user of missing permissions
        if (msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
          await reaction.users.remove(user);
        }
      });

      collector.on("end", pageMsg.reactions.removeAll);
    }
  }
}

module.exports = ListGreetingsCommand;
