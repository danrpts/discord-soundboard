# discord-star-flute

A friendly and customizable soundboard bot for Discord! 🤖

## Requirements

- NodeJS >= 15.5
- PostgresSQL >= 9.5

## Installation

```
git clone https://github.com/danrpts/discord-star-flute.git
cd discord-star-flute
yarn i
```

## Configuration

Configuration is provided through a `.env` and loaded into the environment on boot:

| Environment Variable | Required             | Description                                                                          |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| DISCORD_TOKEN        | true                 | The bot's Discord token created here https://discord.com/developers/applications     |
| DATABASE_URL         | true                 | PostgresSQL URL used to store guild level settings.                                  |
| PREFIX               | no (defaults to `!`) | The default prefix the bot will use unless specified by the `prefix` command is used |
| OWNER_ID             | no                   | The Discord user id who owns the bot.                                                |
| DEBUG                | no                   | Flag used to log debug info to terminal.                                             |

## Usage
