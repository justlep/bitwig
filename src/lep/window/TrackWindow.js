/**
 * Represents a knockout-enhanced, windowed view on tracks.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param name {String}
 * @param numTracks {Number}
 * @param numSends {Number}
 * @param [numScenes] {Number} optional; must be 0 or empty if no `trackBank` is given
 * @param [trackBank] {TrackBank} if null, a MainTrackBank with 0 scenes will be created
 * @constructor
 */
lep.TrackWindow = function(name, numTracks, numSends, numScenes, trackBank) {
    var self = this;
    lep.util.assertNonEmptyString(name, 'Invalid name for TrackWindow: {}', name);
    this.name = name;
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

    this.trackBank = trackBank || host.createMainTrackBank(numTracks, numSends, numScenes || 0);
    this.tracks = lep.util.generateArray(numTracks, function(trackIndex) {
        return self.trackBank.getChannel(trackIndex);
    });

    this.trackScrollPosition = ko.observable(0).updatedByBitwigValue(this.trackBank.channelScrollPosition());
    this.canMoveChannelBack = ko.observable(false).updatedByBitwigValue(this.trackBank.canScrollChannelsUp());
    this.canMoveChannelForth = ko.observable(false).updatedByBitwigValue(this.trackBank.canScrollChannelsDown());

    this.trackScrollSize = (function(_obs) {
        return ko.computed({
            read: _obs,
            write: function(newScrollSize) {
                lep.util.assertNumberInRange(newScrollSize, 1, numTracks, 'Invalid new trackScrollSize "{}" for {}', newScrollSize, self.name);
                // ChannelBank#setChannelScrollStepSize() is still broken in Bitwig 2.2.3
                _obs(newScrollSize);
                host.showPopupNotification('Tracks per scroll: ' + newScrollSize);
            }
        });
    })(ko.observable(1));

    this.moveChannelForth = function() {
        self.trackBank.scrollToChannel( self.trackScrollPosition() + self.trackScrollSize() );
    };
    this.moveChannelPageForth = function() {
        self.trackBank.scrollChannelsPageDown();
    };
    this.moveChannelBack = function() {
        self.trackBank.scrollToChannel( Math.max(0, self.trackScrollPosition() - self.trackScrollSize()) );
    };
    this.moveChannelPageBack = function() {
        self.trackBank.scrollChannelsPageUp();
    };
};

/** @static */
lep.TrackWindow.MAX_TRACKS = 16;
/** @static */
lep.TrackWindow.MAX_SENDS = 16;
/** @static */
lep.TrackWindow.MAX_SCENES = 16;

/**
 *  Creates a TrackWindow instance with a main track bank (and zero scenes).
 * @param numTracks {Number}
 * @param numSends {Number}
 * @static
 */
lep.TrackWindow.createMain = function(numTracks, numSends) {
    return new lep.TrackWindow('MainTrackWindow', numTracks, numSends);
};