/**
 * Represents a launcher slot managed by a ClipWindow.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param trackIndex {Number} track position of the launcherSlot within the parent ClipWindow
 * @param sceneIndex {Number} slot/scene position of the launcherSlot within the parent ClipWindow
 * @param sceneBank {ClipLauncherSlotOrSceneBank} the scene bank this launcher belongs to
 * @constructor
 */
lep.LauncherSlot = function(trackIndex, sceneIndex, sceneBank) {
    this.name = lep.util.formatString('ValueLauncherSlot-{}-{}', trackIndex, sceneIndex);
    this.trackIndex = trackIndex;
    this.sceneIndex = sceneIndex;
    this.sceneBank = sceneBank;
    this.hasContent = ko.observable(false);
    this.state = ko.observable(lep.LauncherSlot.STATE.EMPTY);
};

lep.LauncherSlot.prototype = {
    play: function() {
        this.sceneBank.launch(this.sceneIndex);
    },
    stop: function() {
        this.sceneBank.stop();
    },
    toggle: function() {
        var state = this.state();
        if (state !== lep.LauncherSlot.STATE.EMPTY && state !== lep.LauncherSlot.STATE.STOPPED) {
            this.stop();
        } else {
            this.play();
        }
    }
};

/** @static */
lep.LauncherSlot.STATE = {
    EMPTY: 0,
    STOPPED: 1,
    STOP_QUEUED: 2,
    PLAYING: 3,
    PLAY_QUEUED: 4,
    RECORDING: 5,
    RECORD_QUEUED: 6,
    OTHER: 7
};
