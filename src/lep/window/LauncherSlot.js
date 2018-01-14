/**
 * Represents a launcher slot managed by a MatrixWindow.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {number} trackIndex - track position of the launcherSlot within the parent MatrixWindow
 * @param {number} sceneIndex - slot/scene position of the launcherSlot within its SceneBank
 * @param {ClipLauncherSlotOrSceneBank} sceneBank - the scene bank this launcher slot belongs to
 * @constructor
 */
lep.LauncherSlot = function(trackIndex, sceneIndex, sceneBank) {
    this.name = lep.util.formatString('ValueLauncherSlot-{}-{}', trackIndex, sceneIndex);
    this.trackIndex = trackIndex;
    this.sceneIndex = sceneIndex;
    this.sceneBank = sceneBank;
    this.hasContent = ko.observable(false);
    this._playState = {
        isStop: false,
        isPlay: false,
        isRecord: false,
        isQueued: false
    };
    this.playState = ko.observable(this._playState);
};

lep.LauncherSlot.prototype = {
    play: function() {
        this.sceneBank.launch(this.sceneIndex);
    },
    stop: function() {
        this.sceneBank.stop();
    },
    toggle: function() {
        var state = this.hasContent() && this._playState,
            canStop = !state || (state.isPlay || state.isRecord),
            canPlay = state && (state.isStop || (!state.isPlay && !state.isRecord));

        if (canPlay) {
            this.play();
        } else if (canStop) {
            this.stop();
        }
    },
    /**
     * To be used by the {@link MatrixWindow} only to update this LauncherSlot with updated values from the Bitwig API.
     * @param {boolean} isStop
     * @param {boolean} isPlay
     * @param {boolean} isRecord
     * @param {boolean} isQueued
     */
    updatePlayStateByFlags: function(isStop, isPlay, isRecord, isQueued) {
        // lep.logDev('Update state for {} -> isStop:{}, isPlay:{}, isRecord:{}, isQueued:{}',
        //                              this.name, isStop, isPlay, isRecord, isQueued);
        this._playState.isStop = isStop;
        this._playState.isPlay = isPlay;
        this._playState.isRecord = isRecord;
        this._playState.isQueued = isQueued;
        this.playState.valueHasMutated();
    }
};
