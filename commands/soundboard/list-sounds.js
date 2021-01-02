const { Command } = require("discord.js-commando");

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

    let fields = [];
    for (const sound in sounds) {
      const { url, volume } = sounds[sound];
      fields = [
        ...fields,
        {
          name: sound,
          value: url,
          inline: true
        }
      ];
    }

    fields.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    msg.reply({
      content: "sounds: ",
      split: true,
      embed: {
        fields: fields
      }
    });
  }
}

module.exports = ListSoundsCommand;
