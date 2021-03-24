declare module 'Kannaso' {
  import { EventEmitter } from 'events';
  import { Client as DiscordClient, Base64String, Guild } from 'discord.js';

  export const version: string;

  export class KannasoError extends Error {
    constructor(message: string);
    public name: string;
  }

  export class KannasoTimeout extends Error {
    constructor(time: number);
    public name: string;
  }

  export class KannasoUtil {
    public static mergeDefault(def: Object, given: Object): Object;
    public static searchType(string: string): string;
    public static websocketSend(ws: WebSocket, payload: Object): Promise<void>;
  }

  export class KannasoTrackList {
    type: 'PLAYLIST' | 'TRACK' | 'SEARCH';
    playlistName?: string;
    selectedTrack: number;
    tracks: Array<KannasoTrack>;
  }

  export class KannasoTrack {
    track: string;
    info: {
      identifier?: string;
      isSeekable?: boolean;
      author?: string;
      length?: number;
      isStream?: boolean;
      position?: number;
      title?: string;
      uri?: string;
    };
  }

  export type Source = 'youtube' | 'soundcloud' | 'youtubemusic';

  export enum KannasoStatus {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
  }

  export interface PlayerStartEvent {
    track: string;
    guildId: string;
  }

  export interface PlayerEndEvent {
    reason: 'FINISHED' | 'LOAD_FAILED' | 'STOPPED' | 'REPLACED' | 'CLEANUP';
    track: string;
    guildId: string;
  }

  export interface PlayerExceptionEvent {
    track: string;
    exception: {
      message: string;
      severity: 'COMMON' | 'SUSPICIOUS' | 'FAULT';
      cause: string;
    };
    guildId: string;
  }

  export interface PlayerClosedEvent {
    reason: string;
    code: number;
    byRemote: boolean;
    guildId: string;
  }

  export interface PlayerUpdateEvent {
    guildId: string;
    state: {
      time: number;
      position: number;
      connected: boolean;
    }
  }

  export interface KannasoNodeStats {
    playingPlayers: number;
    op: 'stats';
    memory: {
      reservable: number;
      used: number;
      free: number;
      allocated: number;
    };
    frameStats: {
      sent: number;
      deficit: number;
      nulled: number;
    };
    players: number;
    cpu: {
      cores: number;
      systemLoad: number;
      lavalinkLoad: number;
    };
    uptime: number;
  }

  export interface KannasoJoinOptions {
    guildID: string;
    voiceChannelID: string;
    mute?: boolean;
    deaf?: boolean;
  }

  export interface KannasoPlayOptions {
    noReplace?: boolean,
    pause?: boolean;
    startTime?: number;
    endTime?: number;
  }

  export interface AttemptReconnectOptions {
    voiceChannelID?: string;
    forceReconnect?: boolean;
  }

  export interface KannasoOptions {
    resumable?: boolean | string;
    resumableTimeout?: number;
    reconnectTries?: number;
    moveOnDisconnect?: boolean;
    restTimeout?: number;
    reconnectInterval?: number;
    userAgent?: string;
  }

  export interface KannasoNodeOptions {
    name: string;
    host: string;
    port: number;
    auth: string;
    secure?: boolean;
    group?: string;
  }

  export interface EqualizerBand {
    band: number;
    gain: number;
  }

  export interface KaraokeValue {
    level?: number;
    monoLevel?: number;
    filterBand?: number;
    filterWidth?: number;
  }

  export interface TimescaleValue {
    speed?: number;
    pitch?: number;
    rate?: number;
  }

  export interface TremoloValue {
    frequency?: number;
    depth?: number;
  }

  export interface VibratoValue {
    frequency?: number;
    depth?: number;
  }

  export interface RotationValue {
    rotationHz?: number;
  }

  export interface DistortionValue {
    sinOffset?: number;
    sinScale?: number;
    cosOffset?: number;
    cosScale?: number;
    tanOffset?: number;
    tanScale?: number;
    offset?: number;
    scale?: number;
}



  class KannasoConstants {
    static KannasoStatus: KannasoStatus;
    static KannasoNodeStats: KannasoNodeStats;
    static KannasoJoinOptions: KannasoJoinOptions;
    static KannasoPlayOptions: KannasoPlayOptions;
    static KannasoOptions: KannasoOptions;
    static KannasoNodeOptions: KannasoNodeOptions;
    static KannasoNodes: Array<KannasoNodeOptions>;
    static EqualizerBand: EqualizerBand;
    static KaraokeValue: KaraokeValue;
    static TimescaleValue: TimescaleValue;
    static TremoloValue: TremoloValue;
    static VibratoValue: VibratoValue;
    static RotationValue: RotationValue;
    static DistortionValue: DistortionValue;
  }

  export { KannasoConstants as Constants };

  export class KannasoFilter {
    public volume: number;
    public equalizer: EqualizerBand[];
    public karaoke?: KaraokeValue;
    public timescale?: TimescaleValue;
    public tremolo?: TremoloValue;
    public vibrato?: VibratoValue;
    public rotation?: RotationValue;
    public distortion?: DistortionValue;
  }

  export interface KannasoGroupedFilterOptions {
    volume?: number;
    equalizer?: EqualizerBand[];
    karaoke?: KaraokeValue;
    timescale?: TimescaleValue;
    tremolo?: TremoloValue;
    vibrato?: VibratoValue;
    rotation?: RotationValue;
    distortion?: DistortionValue;
  }

  export class KannasoRest {
    constructor(host: string, port: string, auth: string, userAgent: string, timeout: number, secure: boolean);
    private auth: string;
    private userAgent: string;
    public timeout: number;
    public url: string;

    public resolve(identifier: string, search?: Source): Promise<KannasoTrackList | null>;
    public decode(track: Base64String): Promise<Object>;
    public getLatency(): Promise<number>;
    public getRoutePlannerStatus(): Promise<Object>;
    public unmarkFailedAddress(address: string): Promise<number>;
    public unmarkAllFailedAddress(): Promise<number>;

    private get(url: string, parse: boolean): Promise<JSON>;
    private post(url: string, body: Object): Promise<number>;
    private fetch(url: string, options: Object): Promise<Response>;
  }

  export interface KannasoPlayer {
    on(event: 'end', listener: (data: PlayerEndEvent) => void): this;
    on(event: 'error', listener: (err: KannasoError | Error) => void): this;
    on(event: 'nodeDisconnect', listener: (err: KannasoError) => void): this;
    on(event: 'resumed', listener: () => void): this;
    on(event: 'playerUpdate', listener: (data: PlayerUpdateEvent['state']) => void): this;
    on(event: 'trackException', listener: (data: PlayerExceptionEvent) => void): this;
    on(event: 'closed', listener: (data: PlayerClosedEvent) => void): this;
    on(event: 'start', listener: (data: PlayerStartEvent) => void): this;
    once(event: 'end', listener: (data: PlayerEndEvent) => void): this;
    once(event: 'error', listener: (err: KannasoError | Error) => void): this;
    once(event: 'nodeDisconnect', listener: (err: KannasoError) => void): this;
    once(event: 'resumed', listener: () => void): this;
    once(event: 'playerUpdate', listener: (data: PlayerUpdateEvent['state']) => void): this;
    once(event: 'trackException', listener: (data: PlayerExceptionEvent) => void): this;
    once(event: 'closed', listener: (data: PlayerClosedEvent) => void): this;
    once(event: 'start', listener: (data: PlayerStartEvent) => void): this;
    off(event: 'end', listener: (data: PlayerEndEvent) => void): this;
    off(event: 'error', listener: (err: KannasoError | Error) => void): this;
    off(event: 'nodeDisconnect', listener: (err: KannasoError) => void): this;
    off(event: 'resumed', listener: () => void): this;
    off(event: 'playerUpdate', listener: (data: PlayerUpdateEvent['state']) => void): this;
    off(event: 'trackException', listener: (data: PlayerExceptionEvent) => void): this;
    off(event: 'closed', listener: (data: PlayerClosedEvent) => void): this;
    off(event: 'start', listener: (data: PlayerStartEvent) => void): this;
  }

  export class KannasoPlayer extends EventEmitter {
    constructor(node: KannasoSocket, guild: Guild);
    public voiceConnection: KannasoLink;
    public track: string | null;
    public paused: boolean;
    public position: number;
    public filters: KannasoFilter;

    public disconnect(): void;
    public moveToNode(name: string): Promise<KannasoPlayer>;
    public playTrack(track: string | KannasoTrack, options?: KannasoPlayOptions): Promise<KannasoPlayer>;
    public stopTrack(): Promise<KannasoPlayer>;
    public setPaused(pause?: boolean): Promise<KannasoPlayer>;
    public seekTo(position: number): Promise<KannasoPlayer>;
    public setVolume(volume: number): Promise<KannasoPlayer>;
    public setEqualizer(bands: EqualizerBand[]): Promise<KannasoPlayer>;
    public setKaraoke(karaokeValue?: KaraokeValue): Promise<KannasoPlayer>;
    public setTimescale(timescalevalue?: TimescaleValue): Promise<KannasoPlayer>;
    public setTremolo(tremoloValue?: TremoloValue): Promise<KannasoPlayer>;
    public setVibrato(vibratoValue?: VibratoValue): Promise<KannasoPlayer>;
    public setRotation(rotationValue?: RotationValue): Promise<KannasoPlayer>;
    public setDistortion(distortionValue?: DistortionValue): Promise<KannasoPlayer>;
    public setGroupedFilters(settings?: KannasoGroupedFilterOptions): Promise<KannasoPlayer>;
    public clearFilters(): Promise<KannasoPlayer>;
    public resume(moved: boolean): Promise<void>;

    private connect(options: object): Promise<void>;
    private updateFilters(): Promise<void>;
    private reset(): void;
    private _onLavalinkMessage(json: Object): Promise<void>;
  }

  export class KannasoLink {
    constructor(player: KannasoPlayer, node: KannasoSocket, guild: Guild);
    public player: KannasoPlayer;
    public node: KannasoSocket;
    public guildID: string;
    public shardID: number;
    public sessionID: string | null;
    public voiceChannelID: string | null;
    public lastVoiceChannelID: string | null;
    public region: string | null;
    public selfMute: boolean;
    public selfDeaf: boolean;
    public state: KannasoStatus;
    public channelMoved: boolean;
    public voiceMoved: boolean;
    public reconnecting: boolean;
    public readonly shardPing: number;

    private serverUpdate: object | null;
    private connectTimeout: NodeJS.Timeout | null;

    public attemptReconnect(options: AttemptReconnectOptions): Promise<KannasoPlayer>;

    private setStateUpdate(data: object);
    private setServerUpdate(data: object);
    private moveToNode(node: KannasoSocket): Promise<void>;
    private connect(d: object): Promise<void>;
    private disconnect(): void;
    private send(d: unknown, important: boolean): void;
    private voiceUpdate(): Promise<void>;
    private authenticateFailed(error: KannasoError): void;
  }

  export class KannasoSocket {
    constructor(Kannaso: Kannaso, node: KannasoOptions);
    public Kannaso: Kannaso;
    public players: Map<string, KannasoPlayer>;
    public rest: KannasoRest;
    public state: KannasoStatus;
    public stats: KannasoNodeStats;
    public reconnectAttempts: number;
    public name: string;
    public group?: string;
    public url: string;
    public resumed: boolean;
    public penalties: number;
    public pings: Array<number>;
    public readonly ping: number;

    private auth: string;
    private userAgent: string;
    private resumable: boolean | string;
    private resumableTimeout: number;
    private moveOnDisconnect: boolean;

    public connect(id: string, resumable: boolean | string): void;
    public joinVoiceChannel(options: KannasoJoinOptions): Promise<KannasoPlayer>;
    public leaveVoiceChannel(guildID: string): void;

    private send(data: unknown): Promise<void>;
    private configureResuming(): Promise<void>;
    private executeCleaner(): Promise<void>;

    private _upgrade(response: unknown): void;
    private _open(): void;
    private _message(packet: Object): Promise<void>;
    private _error(error: Error): void;
    private _close(code: number, reason: string): void;
    private _onClientFilteredRaw(packet: Object): void;
    private _onLavalinkMessage(json: Object): Promise<void>;
  }

  export interface Kannaso {
    on(event: 'debug', listener: (name: string, data: string) => void): this;
    on(event: 'error', listener: (name: string, error: KannasoError | Error) => void): this;
    on(event: 'ready', listener: (name: string, reconnect: boolean) => void): this;
    on(event: 'close', listener: (name: string, code: number, reason: string | null) => void): this;
    on(event: 'disconnected', listener: (name: string, reason: string | null) => void): this;
    once(event: 'debug', listener: (name: string, data: string) => void): this;
    once(event: 'error', listener: (name: string, error: KannasoError | Error) => void): this;
    once(event: 'ready', listener: (name: string, reconnect: boolean) => void): this;
    once(event: 'close', listener: (name: string, code: number, reason: string | null) => void): this;
    once(event: 'disconnected', listener: (name: string, reason: string | null) => void): this;
    off(event: 'debug', listener: (name: string, data: string) => void): this;
    off(event: 'error', listener: (name: string, error: KannasoError | Error) => void): this;
    off(event: 'ready', listener: (name: string, reconnect: boolean) => void): this;
    off(event: 'close', listener: (name: string, code: number, reason: string | null) => void): this;
    off(event: 'disconnected', listener: (name: string, reason: string | null) => void): this;
  }

  export class Kannaso extends EventEmitter {
    constructor(client: DiscordClient, nodes: KannasoNodeOptions[], options: KannasoOptions);
    public client: DiscordClient;
    public id: string | null;
    public nodes: Map<string, KannasoSocket>;

    public players: Map<string, KannasoPlayer>;
    public totalPlayers: number;

    private options: KannasoOptions;

    public addNode(nodeOptions: KannasoNodeOptions): void;
    public removeNode(name: string, reason?: string): void;
    public getNode(name?: string | string[]): KannasoSocket;
    public getPlayer(guildId: string): KannasoPlayer | null;

    private _ready(name: string, resumed: boolean): void;
    private _close(name: string, code: number, reason: string): void;
    private _reconnect(node: KannasoSocket): void;
    private _getIdeal(group: string): KannasoSocket;
    private _onClientReady(nodes: KannasoNodeOptions): void;
    private _onClientRaw(packet: Object): void;
  }
}
