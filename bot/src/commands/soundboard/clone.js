const { Command } = require("discord.js-commando");
const { Sound } = require("../../models");
const { range } = require("lodash");

async function batch({
  index,
  pageSize,
  sourceGuildId,
  targetGuildId,
  targetCreatorId
}) {
  const sounds = await Sound.findAll({
    limit: pageSize,
    offset: pageSize * index,
    where: { guild_id: sourceGuildId }
  });

  return Sound.bulkCreate(
    sounds.map(({ name, url, volume }) => ({
      guild_id: targetGuildId,
      creator_id: targetCreatorId,
      name,
      url,
      volume
    })),
    {
      updateOnDuplicate: ["creator_id", "url", "volume"]
    }
  );
}

class CloneCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clone",
      group: "soundboard",
      memberName: "clone",
      description: "Clone a soundboard from one server to another.",
      guildOnly: true,
      args: [
        {
          key: "guildId",
          prompt: "What guild would you like to clone from?",
          type: "string"
        }
      ]
    });
  }

  async run(msg, args) {
    const sourceGuildId = args.guildId;
    const targetGuildId = msg.guild.id;
    const targetCreatorId = msg.author.toString();

    const pageSize = 1000;
    const soundCount = await Sound.count({
      where: {
        guild_id: sourceGuildId
      }
    });
    const pageCount = Math.ceil(soundCount / pageSize);

    const batches = range(0, pageCount).map(index =>
      batch({
        index,
        pageSize,
        soundCount,
        pageCount,
        sourceGuildId,
        targetGuildId,
        targetCreatorId
      })
    );

    // handle individual sounds that can't write due to composite index error
    await Promise.all(batches);
    await msg.react("👍");
  }
}

module.exports = CloneCommand;
