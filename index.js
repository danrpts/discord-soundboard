require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

const { TOKEN, CHANNEL_ID } = process.env;

client.login(TOKEN);

let dispatcher = null;

client.on("message", handleMessage);

async function handleMessage(msg) {
  try {
    if (!msg.guild) return;
    if (msg.author.bot) return;
    if (msg.channel.id !== CHANNEL_ID) return;

    const [command, ...args] = msg.content.trim().split(/\s+/);

    if (!command) return;

    console.info({ command, args });

    switch (command.toLowerCase()) {
      case "!stop":
        // is dispatcher in context? or is this a diff connection
        if (dispatcher) {
          msg.react("👍");
          dispatcher.destroy();
          dispatcher = null;
        }
        break;

      case "!play":
        if (msg.member.voice.channel) {
          const connection = await msg.member.voice.channel.join();
          await connection.voice.setSelfDeaf(true);

          const name = args.length
            ? args.join("-").toLowerCase()
            : "titanic-flute";

          const url = `https://www.myinstants.com/media/sounds/${name}.mp3`;

          dispatcher = connection.play(url, {
            quality: "highestaudio",
            volume: false
          });

          dispatcher.on("start", () => {
            msg.react("👍");
            dispatcher = null;
          });
        }
        break;
    }
  } catch (e) {
    //todo
  }
}
