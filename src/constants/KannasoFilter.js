/**
 * Filters available for customization. See https://github.com/Frederikam/Lavalink/blob/dev/IMPLEMENTATION.md#using-filters
 * @class KannasoFilter
 */
class KannasoFilter {
    /**
     * @param {Object} [settings] settings to intialize this filter with
     * @param {Number} [settings.volume=1.0] volume of this filter
     * @param {Array<KannasoConstants#EqualizerBand>} [settings.equalizer=[]] equalizer of this filter
     * @param {KannasoConstants#KaraokeValue} [settings.karaoke] karaoke settings of this filter
     * @param {KannasoConstants#TimescaleValue} [settings.timescale] timescale settings of this filter
     * @param {KannasoConstants#TremoloValue} [settings.tremolo] tremolo settings of this filter
     * @param {KannasoConstants#VibratoValue} [settings.vibrato] vibrato settings of this filter
     * @param {KannasoConstants#RotationValue} [settings.rotation] rotation settings of this filter
     * @param {KannasoConstants#DistortionValue} [settings.distortion] distortion settings of this filter
     */
    constructor(settings = {}) {
        /**
         * The volume of this filter
         * @type {Number}
         */
        this.volume = settings.volume || 1.0;
        /**
         * The equalizer bands set for this filter
         * @type {Array<KannasoConstants#EqualizerBand>}
         */
        this.equalizer = settings.equalizer || [];
        /**
         * The karaoke settings set for this filter
         * @type {?KannasoConstants#KaraokeValue}
         */
        this.karaoke = settings.karaoke || null;
        /**
         * The timescale settings set for this filter
         * @type {?KannasoConstants#TimescaleValue}
         */
        this.timescale = settings.timescale || null;
        /**
         * The tremolo settings set for this filter
         * @type {?KannasoConstants#TremoloValue}
         */
        this.tremolo = settings.tremolo || null;
        /**
         * The vibrato settings set for this filter
         * @type {?KannasoConstants#VibratoValue}
         */
        this.vibrato = settings.vibrato || null;
        /**
         * The rotation settings set for this filter
         * @type {?KannasoConstants#RotationValue}
         */
        this.rotation = settings.rotation || null;
        /**
         * The distortion settings set for this filter
         * @type {?KannasoConstants#DistortionValue}
         */
        this.distortion = settings.distortion || null;
    }
}

module.exports = KannasoFilter;
