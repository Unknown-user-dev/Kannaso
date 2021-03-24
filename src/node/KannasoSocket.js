const { KannasoStatus, KannasoNodeStats, KannasoJoinOptions } = require('../constants/KannasoConstants.js');
const { CONNECTED, CONNECTING, DISCONNECTED } = KannasoStatus;
const { websocketSend } = require('../util/KannasoUtil.js');
const KannasoError = require('../constants/KannasoError.js');
const KannasoRest = require('../rest/KannasoRest.js');
const KannasoPlayer = require('../guild/KannasoPlayer.js');
const Websocket = require('ws');
const EventEmitter = require('events');

/**
 * KannasoSocket, manages a single Lavalink WS connection.
 * @class KannasoSocket
 */
class KannasoSocket extends EventEmitter {
    /**
     * @extends {EventEmitter}
     * @param  {Kannaso} Kannaso Your Kannaso Instance
     * @param {KannasoOptions} node KannasoNodeOptions Options to initialize Kannaso with
     */
    constructor(Kannaso, node) {
        super();
        /**
        * The Instance of Kannaso where this node initialization is called.
        * @type {Kannaso}
        */
        this.Kannaso = Kannaso;
        /**
        * The active players in this socket/node.
        * @type {Map<string, KannasoPlayer>}
        */
        this.players = new Map();
        /**
        * The REST API of this Socket, mostly to load balance your REST requests instead of relying on a single node.
        * @type {KannasoRest}
        */
        this.rest = new KannasoRest(node.host, node.port, node.auth, Kannaso.options.userAgent, Kannaso.options.restTimeout, node.secure);
        /**
        * The state of this Socket.
        * @type {KannasoConstants#KannasoStatus}
        */
        this.state = DISCONNECTED;
        /**
        * The current stats of this Socket.
        * @type {KannasoConstants#KannasoNodeStats}
        */
        this.stats = KannasoNodeStats;
        /**
        * Attempted reconnects of this Socket. Resets to 0 when the socket opens properly.
        * @type {number}
        */
        this.reconnectAttempts = 0;
        /**
        * Name of this Socket that you can use on .getNode() method of Kannaso.
        * @type {string}
        */
        this.name = node.name;
        /**
        * Group of this socket
        * @type {?string}
        */
        this.group = node.group;
        /**
        * Websocket URL of this socket
        * @type {string}
        */
        this.url = `ws${node.secure ? 's' : ''}://${node.host}:${node.port}`;
        /**
        * If this socket was resumed
        * @type {boolean}
        */
        this.resumed = false;
        /**
         * The last 3 pings for this node
         * @type {Array<number>}
         */
        this.pings = [];

        Object.defineProperty(this, 'auth', { value: node.auth });
    }
    /**
     * Average ping of this node
     * @type {number}
    */
    get ping() {
        return this.pings.reduce((prev, current) => prev + current) / this.pings.length;
    }

    get userAgent() {
        return this.Kannaso.options.userAgent;
    }

    get resumable() {
        return this.Kannaso.options.resumable;
    }

    get resumableTimeout() {
        return this.Kannaso.options.resumableTimeout;
    }

    get moveOnDisconnect() {
        return this.Kannaso.options.moveOnDisconnect;
    }

    /**
    * Penalties of this Socket. The higher the return number, the more loaded the server is.
    * @type {number}
    * @memberof KannasoSocket
    */
    get penalties() {
        let penalties = 0;
        penalties += this.stats.players;
        penalties += Math.round(Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10);
        if (this.stats.frameStats) {
            penalties += this.stats.frameStats.deficit;
            penalties += this.stats.frameStats.nulled * 2;
        }
        return penalties;
    }
    /**
    * Connects this Socket.
    * @param {string} id Your Bot's / Client user id.
    * @param {boolean|string} resumable Determines if we should try to resume the connection.
    * @memberof KannasoSocket
    * @returns {void}
    */
    connect(id, resumable) {
        this.state = CONNECTING;
        const headers = {
            'Client-Name': this.userAgent,
            'User-Agent': this.userAgent,
            'Authorization': this.auth,
            'User-Id': id
        };
        if (resumable) headers['Resume-Key'] = resumable;
        this.emit('debug', this.name,
            '[Node] -> [Lavalink Websocket] : Connecting\n' +
            `  Node                         : ${this.name}\n` +
            `  Client Name & User Agent     : ${this.userAgent}\n` +
            `  Authorization                : ${this.auth.split('').map((letter, index) => index === 0 ? letter : '*').join('')}\n` +
            `  User ID                      : ${id}\n` +
            `  Resumable?                   : ${!!resumable}`
        );
        this.ws = new Websocket(this.url, { headers });
        this.ws.once('upgrade', (...args) => this._upgrade(...args));
        this.ws.once('open', () => this._open());
        this.ws.once('error', (...args) => this._error(...args));
        this.ws.once('close', (...args) => this._close(...args));
        this.ws.on('message', (...args) => this._message(...args));
    }
    /**
     * Creates a player and connects your bot to the specified guild's voice channel
     * @param {KannasoConstants#KannasoJoinOptions} options Join data to send.
     * @memberof KannasoSocket
     * @returns {Promise<KannasoPlayer>}
     * @example
     * <KannasoSocket>.joinVoiceChannel({ guildID: 'guild_id', voiceChannelID: 'voice_channel_id' })
     *     .then((player) => player.playTrack('lavalink_track'));
     */
    async joinVoiceChannel(options = KannasoJoinOptions) {
        if (!options.guildID || !options.voiceChannelID)
            throw new KannasoError('Guild ID or Channel ID is not specified.');
        if (this.state !== CONNECTED)
            throw new KannasoError('This node is not yet ready.');

        const existing = this.players.get(options.guildID);
        if (existing) {
            if (existing.voiceConnection.state !== CONNECTED)
                throw new KannasoError('This player is not yet connected, please wait for it to connect');
            return existing;
        }

        const guild = this.Kannaso.client.guilds.cache.get(options.guildID);
        if (!guild)
            throw new KannasoError('Guild not found, cannot continue creating this connection.');

        const player = new KannasoPlayer(this, guild);

        try {
            this.players.set(guild.id, player);
            await player.connect(options);
            return player;
        } catch (error) {
            this.players.delete(guild.id);
            throw error;
        }
    }
    /**
     * Eventually Disconnects the VoiceConnection & Removes the Player from a Guild.
     * @param {string} guildID The guild id of the player you want to remove.
     * @memberOf KannasoSocket
     * @returns {void}
     */
    leaveVoiceChannel(guildID) {
        const player = this.players.get(guildID);
        if (!player) return;
        player.disconnect();
    }

    async send(data) {
        if (!this.ws || this.ws.readyState !== 1) return;
        await websocketSend(this.ws, JSON.stringify(data));
    }

    async configureResuming() {
        if (!this.resumable) return;
        await this.send({
            op: 'configureResuming',
            key: this.resumable,
            timeout: this.resumableTimeout
        });
    }

    executeCleaner() {
        if (this.resumed) return;
        if (this.moveOnDisconnect && this.Kannaso.nodes.size > 0) {
            for (const player of [...this.players.values()]) {
                player.voiceConnection
                    .moveToNode(this.Kannaso._getIdeal(this.group))
                    .catch(error => player.emit('error', error));
            }
            return;
        }
        let error;
        if (this.moveOnDisconnect) {
            error = new KannasoError(`Node '${this.name}' disconnected; moveOnReconnect is disabled`);
        } else {
            error = new KannasoError(`Node '${this.name}' disconnected; No nodes to reconnect to`);
        }
        for (const player of this.players.values()) {
            player.emit('nodeDisconnect', error);
            player.disconnect();
        }
    }

    _upgrade(response) {
        this.resumed = response.headers['session-resumed'] === 'true';
        this.emit('debug', this.name,
            '[Node] <- [Lavalink Websocket] : Connecting.... Upgrade Response Received\n' +
            `  Node                         : ${this.name}\n` +
            `  Resumed?                     : ${this.resumed}`
        );
    }

    async _open() {
        this.emit('debug', this.name,
            '[Node] <- [Lavalink Websocket] : Websocket Open, Sending Configure Resume Packet\n' +
            `  Node                         : ${this.name}\n` +
            `  Resume-Key                   : ${this.resumable ? this.resumable.split('').map((letter, index) => index === 0 ? letter : '*').join('') : this.resumable}\n` +
            `  Timeout                      : ${this.resumableTimeout}s`
        );
        try {
            await this.configureResuming();
            this.pings.push(await this.rest.getLatency());
            if (this.pings.length > 3) this.pings.pop();
            this.reconnectAttempts = 0;
            this.state = CONNECTED;
            this.emit('debug', this.name,
                '[Node] <- [Lavalink Websocket] : Node Ready, Configure Resume Packet Received\n' +
                `  Node                         : ${this.name}\n` +
                `  Ping                         : ${this.ping}ms\n` +
                `  Resumed Connection?          : ${this.resumed}`
            );
            this.emit('ready', this.name, this.resumed);
        } catch (error) {
            this.ws.close(1011, 'Failed to send the resume packet');
            this.emit('error', this.name, error);
        }
    }

    async _message(message) {
        try {
            await this._onLavalinkMessage(JSON.parse(message));
        } catch (error) {
            this.emit('error', this.name, error);
        }
    }

    _error(error) {
        this.emit('error', this.name, error);
        this.emit('debug', this.name,
            '[Node] <- [Lavalink Websocket] : Websocket Error\n' +
            `  Node                         : ${this.name}\n` +
            `  Error                        : ${error ? error.name : 'Unknown'}`
        );
        this.ws.close(1011, 'Reconnecting the Websocket due to an error');
    }

    _close(code, reason) {
        this.ws.removeAllListeners();
        this.ws = null;
        this.state = DISCONNECTED;
        this.emit('debug', this.name,
            '[Node] <- [Lavalink Websocket] : Websocket Closed\n' +
            `  Node                         : ${this.name}\n` +
            `  Code                         : ${code || '1000'}\n` +
            `  Reason                       : ${reason || 'Unknown'}`
        );
        this.emit('close', this.name, code, reason);
    }

    _onClientFilteredRaw(packet) {
        const player = this.players.get(packet.d.guild_id);
        if (!player) return;
        if (packet.t === 'VOICE_SERVER_UPDATE') {
            player.voiceConnection.setServerUpdate(packet.d);
            return;
        }
        if (packet.d.user_id !== this.Kannaso.id) return;
        player.voiceConnection.setStateUpdate(packet.d);
    }

    async _onLavalinkMessage(json) {
        try {
            this.emit('debug', this.name,
                '[Node] <- [Lavalink Websocket] : Websocket Message\n' +
                `  Node                         : ${this.name}\n` +
                `  OP                           : ${json ? json.op : 'No OP Received'}\n`
            );
            if (!json) return;
            if (json.op === 'stats') {
                this.stats = json;
                const ping = await this.rest.getLatency();
                this.pings.push(ping);
                if (this.pings.length > 3) this.pings.pop();
                return;
            }
            const player = this.players.get(json.guildId);
            if (!player) return;
            await player._onLavalinkMessage(json);
        } catch (error) {
            this.emit('error', this.name, error);
        }
    }
}
module.exports = KannasoSocket;
