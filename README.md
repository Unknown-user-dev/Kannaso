## Kannaso
### A Lavalink wrapper for Discord.JS v12.x.x
[![Discord](https://img.shields.io/discord/423116740810244097?style=flat-square)](https://discordapp.com/invite/FVqbtGu)
[![npm](https://img.shields.io/npm/v/Kannaso?style=flat-square)](https://www.npmjs.com/package/Kannaso)
![Github Stars](https://img.shields.io/github/stars/Unknown-user-dev/Kannaso?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues-raw/Unknown-user-dev/Kannaso?style=flat-square)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/Kannaso?style=flat-square) 
![NPM](https://img.shields.io/npm/l/Kannaso?style=flat-square)

<p align="center">
  <img width="497" height="768" alt="Kannaso" src="https://raw.githubusercontent.com/Unknown-user-dev/Kannaso/master/assets/cover.png"></img>
</p>

```
The ShipGirl Project, feat Kannaso; ⓒ Kancolle
```

### Features

✅ Straightforward

✅ Stable

✅ Feature-rich

✅ Very cute shipgirl ❤ (Very Important)

### Installation

For Lavalink `Master` branch with commits no newer than https://github.com/Frederikam/Lavalink/commit/45f8de045fdd75034b75c63c410121d8315e6b75
```
npm i Kannaso@1.5.2
```
For Lavalink `Dev` branch, or anything that doesn't fall into the scope of commits above
```
npm i Kannaso@1.6.x // Replace x with the latest semver patch available
```
If you live on the edge, and want any update available on Kannaso
```
npm i Unknown-user-dev/Kannaso
```

### Documentation

> https://Unknown-user-dev.github.io/Kannaso/?api

### Changelogs

> https://github.com/Unknown-user-dev/Kannaso/blob/master/CHANGELOGS.MD

### Getting Lavalink

Download binaries from the [CI server](https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1) or the [GitHub](https://github.com/Frederikam/Lavalink/releases) releases.

Put an [application.yml](https://github.com/Frederikam/Lavalink/blob/master/LavalinkServer/application.yml.example) file in your working directory.

Run with `java -jar Lavalink.jar`

Docker images are available on the [Docker](https://hub.docker.com/r/fredboat/lavalink/) hub.

### Other Links

[Support](https://discord.gg/FVqbtGu) | [Lavalink](https://github.com/Frederikam/Lavalink)

### Example

> Bot Implementation: https://github.com/Unknown-user-dev/Kongou

> Basic Implementation:

```js
const { Client } = require('discord.js');
const { Kannaso } = require('Kannaso');

const LavalinkServer = [{ name: 'Localhost', host: 'localhost', port: 6969, auth: 'big_weeb' }];
const KannasoOptions = { moveOnDisconnect: false, resumable: false, resumableTimeout: 30, reconnectTries: 2, restTimeout: 10000 };

class ExampleBot extends Client {
    constructor(opts) {
        super(opts);
        this.Kannaso = new Kannaso(this, LavalinkServer, KannasoOptions);
    }

    login(token) {
        this._setupKannasoEvents();
        this._setupClientEvents();
        return super.login(token);
    }

    _setupKannasoEvents() {
        this.Kannaso.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
        this.Kannaso.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
        this.Kannaso.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
        this.Kannaso.on('disconnected', (name, reason) => console.warn(`Lavalink ${name}: Disconnected, Reason ${reason || 'No reason'}`));
    }

    _setupClientEvents() {
        this.on('message', async (msg) => {
            if (msg.author.bot || !msg.guild) return;
            if (!msg.content.startsWith('$play')) return;
            if (this.Kannaso.getPlayer(msg.guild.id)) return;
            const args = msg.content.split(' ');
            if (!args[1]) return;
            const node = this.Kannaso.getNode();
            let data = await node.rest.resolve(args[1]);
            if (!data) return;
            const player = await node.joinVoiceChannel({
                guildID: msg.guild.id,
                voiceChannelID: msg.member.voice.channelID
            }); 
            player.on('error', (error) => {
                console.error(error);
                player.disconnect();
            });
            for (const event of ['end', 'closed', 'nodeDisconnect']) player.on(event, () => player.disconnect());
            data = data.tracks.shift();
            await player.playTrack(data); 
            await msg.channel.send("Now Playing: " + data.info.title);
        });
        this.on('ready', () => console.log('Bot is now ready'));
    }
}

new ExampleBot()
    .login('token')
    .catch(console.error);
```

> Made with ❤ by @Sāya#0113
