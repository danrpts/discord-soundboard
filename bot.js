require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("message", handleMessage);

async function handleMessage(msg) {
  try {
    if (!msg.guild) return;
    if (msg.author.bot) return;

    const [command, ...args] = msg.content.trim().split(/\s+/);

    if (!command) return;

    console.info({ command, args });

    switch (command.toLowerCase()) {
      case "!stop":
        // todo
        break;

      case "!play":
        if (msg.member.voice.channel) {
          const connection = await msg.member.voice.channel.join();
          await connection.voice.setSelfDeaf(true);

          const name = args.length
            ? args.join("-").toLowerCase()
            : "titanic-flute";

          const url = `https://www.myinstants.com/media/sounds/${name}.mp3`;

          const dispatcher = connection.play(url, {
            quality: "highestaudio",
            volume: false
          });

          dispatcher.on("start", () => {
            msg.react("👍");
          });
        }
        break;
    }
  } catch (e) {
    //todo
  }
}

client.login();
