# discord-soundboard

A friendly and customizable soundboard bot for Discord! 🤖

## Features

- Play sounds from around the net
- Set greetings for users when they enter voice channel
- Save sounds, greetings, and volumes across all your server's voice channels
- Clone soundboards from your other servers

## One-Click Bot

<p>
  <a href="https://discord.com/oauth2/authorize?client_id=792651273387638815&permissions=8192&scope=bot">
    <img align="left" src="/soundbyte.png" width="100" height="100" alt="SoundByte Avatar" />
  </a>

  <br/>
SoundByte is ready to join your server at <a href="https://discord.com/oauth2/authorize?client_id=792651273387638815&permissions=8192&scope=bot">the click of a link</a>. Please provide the bot with "Manage Messages" permission for the best experience while using the <code>!list</code> command.

</p>
<br/>

## Usage

By default the bot uses `!` for the command prefix, which you can may change using `!prefix`.
Below is a minimum set of commands to get started. Use `!help` to see more!

| Command | Description                                            |
| ------- | ------------------------------------------------------ |
| `!add`  | Add a sound to your server's soundboard.               |
| `!list` | List or search for sounds in your server's soundboard. |
| `!play` | Plays a sound over your current voice channel.         |

## Development

First of all, you need to clone the repo:
`git clone git@github.com:danrpts/discord-soundboard.git`

### Requirements

We'll be using Docker to simplify development, testing, and deployment. Please [install Docker](https://docs.docker.com/get-docker/) before moving to the next step.

### Configuration

All configuration for the bot is provided through environment variables. The table below is a minimum set you may want to provide for development. Make sure you [follow this awesome tutorial](https://youtu.be/ibtXXoMxaho) to create your `DISCORD_TOKEN` through the [Discord Developer Portal](https://discord.com/developers/applications).

| Variable         | Description                                                                                                                     | Required? |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------- |
| DATABASE_URL     | A PG [connection string](https://github.com/brianc/node-postgres/tree/master/packages/pg-connection-string#connection-strings). | NO        |
| DISCORD_TOKEN    | Your secret Discord bot token.                                                                                                  | YES       |
| DISCORD_OWNER_ID | A Discord user id associated with the bot.                                                                                      | NO        |

### Fire 'er Up! 🚀

Now, you're ready. Set the `DISCORD_TOKEN` environment variable and use `docker-compose` from the root of your project directory:

```
DISCORD_TOKEN="place_your_bot_token_here"\
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Deployment

❗WIP

## Support

❗WIP

## Contributing

❗WIP

[Contribution guidelines for this project](CONTRIBUTING.md)

## License

[License agreement for this project](LICENSE)
