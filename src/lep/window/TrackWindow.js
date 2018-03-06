/**
 * Represents a knockout-enhanced, windowed view on tracks.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {string} name
 * @param {number} numTracks
 * @param {number} numSends
 * @param {?number} [numScenes] - optional; must be 0 or empty if no `trackBank` is given
 * @param {?TrackBank} [trackBank] - if null, a MainTrackBank with 0 scenes will be created
 * @constructor
 */
lep.TrackWindow = function(name, numTracks, numSends, numScenes, trackBank) {
    lep.util.assertNonEmptyString(name, 'Invalid name for TrackWindow: {}', name);
    lep.util.assertNumberInRange(numTracks, 1, lep.TrackWindow.MAX_TRACKS, 'Invalid numTracks for {}: {}', name, numTracks);
    lep.util.assertNumberInRange(numSends, 0, lep.TrackWindow.MAX_SENDS, 'Invalid numSends for {}: {}', name, numSends);
    if (!this._super) {
        lep.util.assert(!numScenes, 'Invalid numScenes={} for {}. Use ClipWindow for multi-scene windows.', numScenes, name);
    } else {
        // derived classes like ClipWindow can have more scenes
        lep.util.assertNumberInRange(numScenes, 0, lep.TrackWindow.MAX_SCENES, 'Invalid numScenes={} for {}', numScenes, name);
    }
    if (trackBank) {
        lep.util.assertFunction(trackBank.followCursorTrack, 'Invalid trackBank for {}: {}', name, trackBank);
    }

    var self = this;

    this.name = name;
    this.trackBank = trackBank || host.createMainTrackBank(numTracks, numSends, numScenes || 0);
    this.tracks = lep.util.generateArray(numTracks, function(trackIndex) {
        return self.trackBank.getItemAt(trackIndex);
    });

    var _scrollable = new lep.ScrollableView(name, numTracks, this.trackBank);

    this.trackScrollSize = _scrollable.scrollSize;
    this.totalChannels = _scrollable.totalItems;
    this.canMoveChannelBack = _scrollable.canMoveBack;
    this.canMoveChannelForth = _scrollable.canMoveForth;
    this.moveChannelForth = _scrollable.moveForth;
    this.moveChannelPageForth = _scrollable.movePageForth;
    this.moveChannelBack = _scrollable.moveBack;
    this.moveChannelPageBack = _scrollable.movePageBack;
};

/** @static */
lep.TrackWindow.MAX_TRACKS = 16;
/** @static */
lep.TrackWindow.MAX_SENDS = 16;
/** @static */
lep.TrackWindow.MAX_SCENES = 16;

/**
 * Creates a TrackWindow instance with a main track bank (and zero scenes).
 * @param {number} numTracks
 * @param {number} numSends
 * @return {lep.TrackWindow}
 * @static
 */
lep.TrackWindow.createMain = function(numTracks, numSends) {
    return new lep.TrackWindow('MainTrackWindow', numTracks, numSends);
};