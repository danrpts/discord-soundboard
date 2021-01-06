const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");
const { clamp } = require("lodash");

async function page({ guildId, index, pageSize }) {
  const sounds = await Sound.findAll({
    limit: pageSize,
    offset: pageSize * index,
    where: { guild_id: guildId }
  });

  const fields = sounds.map(({ name, url, volume }) => ({
    name: name,
    value: `[:link:](${url})` + (volume ? ` | (${volume}%)` : ""),
    inline: true
  }));

  return new MessageEmbed().addFields(fields);
}

class ListCommand extends Command {
  constructor(client) {
    super(client, {
      name: "list",
      aliases: ["ls"],
      group: "soundboard",
      memberName: "list",
      description: "List all sounds in your guild's soundboard.",
      guildOnly: true,
      args: [
        {
          key: "pageSize",
          prompt: "How many sound to show per page?",
          default: 12,
          max: 12,
          min: 1,
          type: "integer"
        }
      ]
    });
  }

  async run(msg, args) {
    const guildId = msg.guild.id;
    const soundCount = await Sound.count({ where: { guild_id: guildId } });

    if (soundCount < 1) {
      return msg.reply("your guild's soundboard is empty.");
    }

    let index = 0;
    const pageSize = args.pageSize;
    const pageCount = Math.ceil(soundCount / pageSize);

    const pageMsg = await msg.channel.send(
      `Page ${index + 1} / ${pageCount} -- ${soundCount} total sounds`,
      {
        embed: await page({
          guildId,
          pageSize,
          index,
          soundCount,
          pageCount
        })
      }
    );

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
        await pageMsg.edit(
          `Page ${index + 1} / ${pageCount} -- ${soundCount} total sounds`,
          {
            embed: await page({
              guildId,
              index,
              pageSize,
              soundCount,
              pageCount
            })
          }
        );

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
