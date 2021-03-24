const { KannasoOptions, KannasoNodeOptions, KannasoStatus } = require('./constants/KannasoConstants.js');
const { CONNECTED } = KannasoStatus;
const { mergeDefault, getVersion } = require('./util/KannasoUtil.js');
const KannasoError = require('./constants/KannasoError.js');
const KannasoSocket = require('./node/KannasoSocket.js');
const EventEmitter = require('events');
const { variant, version } = getVersion();

/**
  * Kannaso, governs the client's node connections.
  * @class Kannaso
  * @extends {EventEmitter}
  */
class Kannaso extends EventEmitter {
    /**
     * @param  {Client} client Your Discord.js client
     * @param {KannasoConstants#KannasoNodes} nodes Lavalink Nodes where Kannaso will try to connect to.
     * @param {KannasoConstants#KannasoOptions} options Options to initialize Kannaso with
     */
    constructor(client, nodes, options) {
        super();
        if (variant === 'light') {
            if (!version.startsWith('3'))
                throw new KannasoError('Kannaso will only work at Discord.JS-light v3. Versions below Discord.JS-light v3 is not supported.');
        } else {
            if (!version.startsWith('12'))
                throw new KannasoError('Kannaso will only work at Discord.JS v12. Versions below Discord.JS v12 is not supported.');
        }
        if (!nodes || !nodes.length)
            throw new KannasoError('No nodes supplied');
        /**
        * The instance of Discord.js client used with Kannaso.
        * @type {external.Client}
        */
        this.client = client;
        /**
        * The user id of the bot that is being governed by Kannaso.
        * @type {?string}
        */
        this.id = null;
        /**
        * The current nodes that is being handled by Kannaso.
        * @type {Map<string, KannasoSocket>}
        */
        this.nodes = new Map();

        Object.defineProperty(this, 'options', { value: mergeDefault(KannasoOptions, options) });

        this.client.once('ready', () => this._onClientReady(nodes));
        this.client.on('raw', event => this._onClientRaw(event));
    }
    /**
     * Gets all the Players that is currently active on all nodes in this instance.
     * @type {Map<string, KannasoPlayer>}
     * @memberof Kannaso
     */
    get players() {
        const players = new Map();
        for (const node of this.nodes.values()) {
            for (const [id, player] of node.players) players.set(id, player);
        }
        return players;
    }
    /**
     * Gets the number of total Players that is currently active on all nodes in this instance.
     * @type {number}
     * @memberof Kannaso
     */
    get totalPlayers() {
        let counter = 0;
        for (const node of this.nodes.values()) counter += node.players.size;
        return counter;
    }

    /**
     * Debug related things, enable if you have an issue and planning to report it to the developer of this Lib.
     * @event Kannaso#debug
     * @param {string} name The name of the KannasoSocket that sent a debug event.
     * @param {Object} data The actual debug data
     * @memberof Kannaso
     */
    /**
     * Emitted when a KannasoSocket encounters an internal error, MUST BE HANDLED.
     * @event Kannaso#error
     * @param {string} name The name of the KannasoSocket that sent an error event.
     * @param {Error} error The error encountered.
     * @memberof Kannaso
     * @example
     * // <Kannaso> is your own instance of Kannaso
     * <Kannaso>.on('error', console.error);
     */
    /**
     * Emitted when a KannasoSocket becomes Ready from a reconnection or first initialization.
     * @event Kannaso#ready
     * @param {string} name The name of the KannasoSocket that sent a ready event.
     * @param {boolean} reconnect true if the session reconnected, otherwise false.
     * @memberof Kannaso
     */
    /**
     * Emitted when a KannasoSocket closed it's websocket connection to a Lavalink Server.
     * @event Kannaso#close
     * @param {string} name The name of the KannasoSocket that sent a close event.
     * @param {number} code The WebSocket close code https://github.com/Luka967/websocket-close-codes
     * @param {reason} reason The reason for this close event.
     * @memberof Kannaso
     */
    /**
     * Emitted when a KannasoSocket is removed and will not try to reconnect again.
     * @event Kannaso#disconnected
     * @param {string} name The name of the KannasoSocket that sent a close event.
     * @param {string} reason The reason for the disconnect.
     * @memberof Kannaso
     */

    /**
    * Function to register a new KannasoSocket
    * @param {KannasoConstants#KannasoNodeOptions} nodeOptions The Node Options to be used to connect to.
    * @memberof Kannaso
    * @returns {void}
    */
    addNode(nodeOptions) {
        if (!this.id)
            throw new KannasoError('The lib is not yet ready, make sure to initialize Kannaso before the library fires "ready" event');
        const node = new KannasoSocket(this, nodeOptions);
        node.on('debug', (...args) => this.emit('debug', ...args));
        node.on('error', (...args) => this.emit('error', ...args));
        node.on('ready', (...args) => this._ready(...args));
        node.on('close', (...args) => this._close(...args));
        node.emit('debug', node.name,
            '[Kannaso] <- [Node] : Connecting\n' +
            `  Node               : ${node.name}\n` +
            `  Websocket          : ${node.url}\n` +
            `  Group              : ${node.group}`
        );
        node.connect(this.id, false);
        this.nodes.set(node.name, node);
    }
    /**
     * Function to remove an existing KannasoSocket
     * @param {string} name The Lavalink Node to remove
     * @param {string} [reason] Optional reason for this disconnect.
     * @memberof Kannaso
     * @returns {void}
     */
    removeNode(name, reason = 'Remove node executed') {
        if (!this.id)
            throw new KannasoError('The lib is not yet ready, make sure to initialize Kannaso before the library fires "ready" event');
        const node = this.nodes.get(name);
        if (!node)
            throw new KannasoError('The node name you specified doesn\'t exist');
        this.nodes.delete(node.name);
        node.removeAllListeners();
        node.executeCleaner();
        if (node.ws) node.ws.close(1000, reason);
        node.emit('debug', node.name,
            '[Kannaso] <- [Node] : Disconnected\n' +
            `  Node               : ${node.name}\n` +
            `  Reason             : ${reason}`
        );
        this.emit('disconnected', name, reason);
    }
    /**
     * Shortcut to get the Ideal Node or a manually specified Node from the current nodes that Kannaso governs.
     * @param {string|Array<string>} [query] If blank, Kannaso will return an ideal node from default group of nodes. If a string is specified, will return a node from it's name, if an array of string groups, Kannaso will return an ideal node from the specified array of grouped nodes.
     * @memberof Kannaso
     * @returns {KannasoSocket}
     * @example
     * const node = <Kannaso>.getNode();
     * node.rest.resolve('Kongou Burning Love', 'youtube')
     *     .then(data =>
     *         node.joinVoiceChannel({ guildID: 'guild_id', voiceChannelID: 'voice_channel_id' })
     *             .then(player => player.playTrack(data.track))
     *     )
     */
    getNode(query) {
        if (!this.id)
            throw new KannasoError('The lib is not yet ready, make sure to initialize Kannaso before the library fires "ready" event');
        if (!this.nodes.size)
            throw new KannasoError('No nodes available, please add a node first.');
        if (!query || Array.isArray(query))
            return this._getIdeal(query);
        const node = this.nodes.get(query);
        if (!node)
            throw new KannasoError('The node name you specified is not one of my nodes');
        if (node.state !== CONNECTED)
            throw new KannasoError('This node is not yet ready');
        return node;
    }
    /**
    * Shortcut to get the player of a guild, if there is any.
    * @param {string} guildID The guildID of the guild you are trying to get.
    * @memberof Kannaso
    * @returns {?KannasoPlayer}
    */
    getPlayer(guildID) {
        if (!this.id)
            throw new KannasoError('The lib is not yet ready, make sure to initialize Kannaso before the library fires "ready" event');
        if (!guildID) return null;
        return this.players.get(guildID);
    }

    _ready(name, resumed) {
        const node = this.nodes.get(name);
        node.executeCleaner();
        node.emit('debug', node.name,
            '[Kannaso] <- [Node] : Connected\n' +
            `  Node               : ${node.name}\n` +
            `  Resumed Sesssion?  : ${resumed}`
        );
        this.emit('ready', name, resumed);
    }

    _close(name, code, reason) {
        const node = this.nodes.get(name);
        if (!node) return;
        this.emit('close', name, code, reason);
        this._reconnect(node);
    }

    _reconnect(node) {
        if (node.reconnectAttempts >= this.options.reconnectTries) {
            node.emit('debug', node.name,
                '[Kannaso] <- [Node] : Disconnecting\n' +
                `  Node               : ${node.name}\n` +
                `  Reason             : Can't reconnect after ${this.options.reconnectTries} attempt(s)`
            );
            this.removeNode(node.name, `Can't reconnect after ${this.options.reconnectTries} attempt(s)`);
            return;
        }
        node.reconnectAttempts++;
        node.emit('debug', node.name,
            '[Kannaso] <- [Node] : Reconnecting\n' +
            `  Node               : ${node.name}\n` +
            `  Attempts Remaining : ${this.options.reconnectTries - node.reconnectAttempts}\n` +
            `  Reconnecting in    : ${this.options.reconnectInterval}ms`
        );
        setTimeout(() => node.connect(this.id, this.options.resumable), this.options.reconnectInterval);
    }

    _getIdeal(group) {
        const nodes = [...this.nodes.values()]
            .filter(node => node.state === CONNECTED);
        if (!group) {
            return nodes
                .sort((a, b) => a.penalties - b.penalties)
                .shift();
        }
        return nodes
            .filter(node => group.includes(node.group))
            .sort((a, b) => a.penalties - b.penalties)
            .shift();
    }

    _onClientReady(nodes) {
        this.emit('debug', 'Manager',
            '[Kannaso] [Manager] : Client Ready, Connecting Nodes\n' +
            `Client ID            : ${this.client.user.id}\n` +
            `Initial Nodes        : ${nodes.length}`
        );
        this.id = this.client.user.id;
        for (const node of nodes) this.addNode(mergeDefault(KannasoNodeOptions, node));
    }

    _onClientRaw(packet) {
        if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) return;
        for (const node of this.nodes.values()) node._onClientFilteredRaw(packet);
    }
}
module.exports = Kannaso;
