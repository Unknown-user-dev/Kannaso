const { name, version, repository } = require('../../package.json');
/**
 * Constants for Kannaso.
 * @class KannasoConstants
 */
class KannasoConstants {
    /**
    * Available Status for Node / Link managers.
    * @typedef {string} KannasoStatus
    * @enum {KannasoStatus}
    * @memberof KannasoConstants#
    */
    static get KannasoStatus() {
        return {
            CONNECTING: 'CONNECTING',
            CONNECTED: 'CONNECTED',
            DISCONNECTING: 'DISCONNECTING',
            DISCONNECTED: 'DISCONNECTED'
        };
    }
    /**
    * Kannaso's Node Stats Object.
    * @typedef {Object} KannasoNodeStats
    * @memberof KannasoConstants#
    */
    static get KannasoNodeStats() {
        return {
            playingPlayers: 0,
            op: 'stats',
            memory: {
                reservable: 0,
                used: 0,
                free: 0,
                allocated: 0
            },
            frameStats: {
                sent: 0,
                deficit: 0,
                nulled: 0
            },
            players: 0,
            cpu: {
                cores: 0,
                systemLoad: 0,
                lavalinkLoad: 0
            },
            uptime: 0
        };
    }
    /**
    * Required Object in Kannaso's join method.
    * @typedef {Object} KannasoJoinOptions
    * @property {string} guildID Guild ID of the Voice Channel you want to join to.
    * @property {string} voiceChannelID Voice Channel ID of the Voice Channel you want to join to.
    * @property {boolean} [mute=false] Whether to mute the client.
    * @property {boolean} [deaf=false] Whether to deafen the client.
    * @memberof KannasoConstants#
    */
    static get KannasoJoinOptions() {
        return {
            guildID: null,
            voiceChannelID: null,
            mute: false,
            deaf: false
        };
    }
    /**
    * Required Object in Kannaso's join method.
    * @typedef {Object} KannasoPlayOptions
    * @property {boolean} [noReplace=true] Specifies if the player will not replace the current track when executing this action.
    * @property {boolean} [pause=false] If `true`, the player will pause when the track starts playing.
    * @property {?number} [startTime] In milliseconds on when to start.
    * @property {?number} [endTime] In milliseconds on when to end.
    * @memberof KannasoConstants#
    */
    static get KannasoPlayOptions() {
        return {
            noReplace: true,
            pause: false,
            startTime: undefined,
            endTime: undefined
        };
    }
    /**
    * Options that Kannaso accepts upon initialization.
    * @typedef {Object} KannasoOptions
    * @property {boolean|string} [resumable=false] If you want your node to support resuming. Just replace the false with the resume-key you want to enable resuming.
    * @property {number} [resumableTimeout=30] Timeout when Lavalink will decide a player isn't resumed and will destroy the connection to it, measured in seconds.
    * @property {number} [reconnectTries=2] Amount of tries to connect to the lavalink Node before it decides that the node is unreconnectable.
    * @property {boolean} [moveOnDisconnect=false] Specifies if the library will attempt to reconnect players on a disconnected node to another node.
    * @property {number} [restTimeout=15000] Timeout on rest requests to your lavalink node, measured in milliseconds.
    * @property {number} [reconnectInterval=5000] Timeout between reconnect attempts, measured in milliseconds.
    * @property {string} [userAgent="{name}/{version} (+{url})"] User-Agent to use on connecting to WS and REST requests
    * @memberof KannasoConstants#
    */
    static get KannasoOptions() {
        return {
            resumable: false,
            resumableTimeout: 30,
            reconnectTries: 2,
            moveOnDisconnect: false,
            restTimeout: 15000,
            reconnectInterval: 5000,
            userAgent: `${name}/${version} (${repository.url})`
        };
    }
    /**
    * Options that Kannaso needs to initialize a lavalink node.
    * @typedef {Object} KannasoNodeOptions
    * @property {string} name Your Node Name, anything you want to name your node.
    * @property {string} host Your node host / ip address of where the lavalink is hosted.
    * @property {number} port The Port Number of your lavalink instance.
    * @property {string} auth The authentication key you set on your lavalink config.
    * @property {?boolean} [secure] If you want to use https and wss instead of http and ws.
    * @property {?string} [group] Group of this node, used for grouping specific nodes.
    * @memberof KannasoConstants#
    */
    static get KannasoNodeOptions() {
        return {
            name: null,
            host: null,
            port: null,
            auth: null,
            secure: false,
            group: undefined
        };
    }
    /**
     * An array of KannasoNodeOptions
     * @typedef {Array<KannasoNodeOptions>} KannasoNodes
     * @memberof KannasoConstants#
     */
    static get KannasoNodes() {
        return [].push(KannasoConstants.KannasoNodeOptions);
    }
    /**
     * Available settings for an Equalizer Band
     * @typedef {EqualizerBand} EqualizerBand
     * @property {number} band Equalizer Band Level
     * @property {number} gain Equalizer Gain Level
     * @memberof KannasoConstants#
     */
    static get EqualizerBand() {
        return {
            band: 0,
            gain: 0
        };
    }
    /**
     * Available settings for Karaoke
     * @typedef {KaraokeValue} KaraokeValue
     * @property {?number} [level] Karaoke level
     * @property {?number} [monoLevel] Karaoke MonoLevel
     * @property {?number} [filterBand] Karaoke FilterBand
     * @property {?number} [filterWidth] Karaoke FilterWidth
     * @memberof KannasoConstants#
     */
    static get KaraokeValue() {
        return {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        };
    }
    /**
     * Available settings for Timescale
     * @typedef {TimescaleValue} TimescaleValue
     * @property {?number} [speed] Timescale Speed
     * @property {?number} [pitch] Timescale Pitch
     * @property {?number} [rate] Timescale Rate
     * @memberof KannasoConstants#
     */
    static get TimescaleValue() {
        return {
            speed: 1.0,
            pitch: 1.0,
            rate: 1.0
        };
    }
    /**
     * Available settings for Tremolo
     * @typedef {TremoloValue} TremoloValue
     * @property {?number} [frequency] Tremolo Frequency
     * @property {?number} [depth] Tremolo Depth
     * @memberof KannasoConstants#
     */
    static get TremoloValue() {
        return {
            frequency: 2.0,
            depth: 0.5
        };
    }
    /**
     * Available settings for Vibrato
     * @typedef {VibratoValue} VibratoValue
     * @property {?number} [frequency] Vibrato Frequency
     * @property {?number} [depth] Vibrato Depth
     * @memberof KannasoConstants#
     */
    static get VibratoValue() {
        return {
            frequency: 2.0,
            depth: 0.5
        };
    }
    /**
     * Available settings for Rotation
     * @typedef {RotationValue} RotationValue
     * @property {?number} [rotationHz] Frequency of the audio rotating
     * @memberof KannasoConstants#
     */
    static get RotationValue() {
        return { rotationHz: 0 };
    }
    /**
     * Available settings for Distortion
     * @typedef {DistortionValue} DistortionValue
     * @property {?number} [sinOffset] Sin Offset
     * @property {?number} [sinScale] Sin Scale
     * @property {?number} [cosOffset] Cos Offset
     * @property {?number} [cosScale] Cos Scale
     * @property {?number} [tanOffset] Tan Offset
     * @property {?number} [tanScale] Tan Scale
     * @property {?number} [offset] Offset
     * @property {?number} [scale] Scale
     * @memberof KannasoConstants#
     */
    static get DistortionValue() {
        return {
            sinOffset: 0,
            sinScale: 1,
            cosOffset: 0,
            cosScale: 1,
            tanOffset: 0,
            tanScale: 1,
            offset: 0,
            scale: 1
        };
    }
}
module.exports = KannasoConstants;
