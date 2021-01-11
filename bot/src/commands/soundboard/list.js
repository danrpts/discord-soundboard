const colormap = require("colormap");
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");
const { clamp } = require("lodash");
const { Op } = require("sequelize");

async function page({
  guildId,
  index,
  pageSize,
  pageCount,
  resultCount,
  color,
  filter
}) {
  const sounds = await Sound.findAll({
    limit: pageSize,
    offset: pageSize * index,
    where: {
      guild_id: guildId,
      ...(filter && { name: { [Op.like]: `%${filter.toLowerCase()}%` } })
    },
    order: [["name", "ASC"]]
  });

  const fields = sounds.map(({ name, url, volume }) => ({
    name,
    value: `[:link:](${url})` + (volume ? ` | (${volume}%)` : ""),
    inline: true
  }));

  const footer = `Page ${index + 1} / ${pageCount} • ${resultCount} results`;

  return new MessageEmbed()
    .setColor(color)
    .addFields(fields)
    .setFooter(footer);
}

class ListCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list",
      aliases: ["ls"],
      group: "soundboard",
      memberName: "list",
      description: "List or search for sounds in your server's soundboard.",
      guildOnly: true,
      args: [
        {
          key: "filter",
          prompt: "Would you like to filter the list with a search term?",
          default: "",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const filter = args.filter;
    const resultCount = await Sound.count({
      where: {
        guild_id: guildId,
        ...(filter && { name: { [Op.like]: `%${filter.toLowerCase()}%` } })
      }
    });

    if (args.filter && resultCount < 1) {
      return msg.reply("no sounds exist for that filter.");
    }

    if (resultCount < 1) {
      return msg.reply("your guild's soundboard is empty.");
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
        color: colors[index],
        filter
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
            color: colors[index],
            filter
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

module.exports = ListCommand;
