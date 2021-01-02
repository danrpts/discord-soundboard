const colormap = require("colormap");
const { chain, mapValues, sortBy, clamp } = require("lodash");
const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

const MAX_PAGE_COUNT = 12;
const COLOR_MAP = colormap({
  colormap: "portland",
  nshades: 9,
  format: "hex",
  alpha: 1
});

function pagedEmbeds(sounds) {
  return chain(sounds)
    .mapValues(({ url, volume }, sound) => ({
      name: `${sound} (${volume}%)`,
      value: `[:link:](${url})`,
      inline: true
    }))
    .sortBy(["name"])
    .chunk(MAX_PAGE_COUNT)
    .map((fields, index, chunks) =>
      new MessageEmbed()
        .setColor(COLOR_MAP[index % COLOR_MAP.length])
        .setTitle(`Page ${index + 1} / ${chunks.length}`)
        .addFields(fields)
    )
    .value();
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
    const pages = pagedEmbeds(sounds);

    const listingMsg = await msg.channel.send({ embed: pages[0] });
    await Promise.all(["⏪", "◀️", "▶️", "⏩"].map(c => listingMsg.react(c)));

    const collector = listingMsg.createReactionCollector(
      (reaction, user) => !user.bot,
      { time: 60000 }
    );

    let currentIndex = 0;
    collector.on("collect", async (reaction, user) => {
      switch (reaction.emoji.name) {
        case "⏪":
          currentIndex = 0;
        case "◀️":
          currentIndex -= 1;
          break;
        case "▶️":
          currentIndex += 1;
          break;
        case "⏩":
          currentIndex = pages.length - 1;
          break;
      }
      currentIndex = clamp(currentIndex, 0, pages.length - 1);
      await reaction.users.remove(user);
      await listingMsg.edit({ embed: pages[currentIndex] });
    });

    collector.on("end", async () => {
      await listingMsg.reactions.removeAll();
    });
  }
}

module.exports = ListSoundsCommand;
