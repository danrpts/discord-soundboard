# discord-star-flute

A friendly and customizable soundboard bot for Discord.

## Requirements

## Installation

`git clone https://github.com/danrpts/discord-star-flute.git`

## Configuration

Configuration for the bot is done through `.env` file. These variables will be loaded into the environment on boot.

| Environment Variable | Required             | Description                                                                          |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| DISCORD_TOKEN        | true                 | The bot's Discord token created here https://discord.com/developers/applications     |
| DATABASE_URL         | true                 | PostgresSQL URL used to store guild level settings.                                  |
| MP3_HOST             | true                 | URL of the host that will be used to source mp3s                                     |
| PREFIX               | no (defaults to `!`) | The default prefix the bot will use unless specified by the `prefix` command is used |
| OWNER_ID             | no                   | The Discord user id who owns the bot.                                                |
| DEBUG                | no                   | Flag used to log debug info to terminal.                                             |

## Usage
