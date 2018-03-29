/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseControl}
 */
lep.Fader = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        if (!opts.isUnidirectional && typeof opts.useImmediateSync !== 'boolean') {
            // bidirectional faders should be synced via flush unless explicitly configured otherwise
            opts.useImmediateSync = false;
        }
        this._super(opts);

        if (opts.muteOnTouch) {
            this.initMuteOnTouch(opts.touchNote, opts.touchCC, (typeof opts.touchChannel === 'number') ? opts.touchChannel : opts.midiChannel);
        }
    },
    initMuteOnTouch: function(touchNote, touchCC, touchChannel) {
        var useTouchCC = typeof touchCC === 'number',
            useTouchNote = (typeof touchNote === 'number');

        lep.util.assertNumberInRange(touchChannel, 0, 15, 'Invalid touchChannel for {}: {}', this.name, touchChannel);
        lep.util.assert(useTouchCC !== useTouchNote, 'Invalid combination of touchNote {} / touchCC {} for {}',
            touchNote, touchCC, this.name);

        if (useTouchNote) {
            lep.util.assertNumberInRange(touchNote, 0, 127, 'Invalid touchNote for {}: {}', this.name, touchNote);
            lep.MidiEventDispatcher.getInstance().onNotePressed(touchNote, this._muteOrUnmuteTouchHandler, this, touchChannel);
            lep.MidiEventDispatcher.getInstance().onNoteReleased(touchNote, this._muteOrUnmuteTouchHandler, this, touchChannel);
        } else {
            lep.util.assertNumberInRange(touchCC, 0, 127, 'Invalid touchCC for {}: {}', this.name, touchCC);
            lep.MidiEventDispatcher.getInstance().onCC(touchCC, this._muteOrUnmuteTouchHandler, this, touchChannel);
        }
    },
    _muteOrUnmuteTouchHandler: function(noteOrCc, value, channel) {
        this.syncToMidi = value ? lep.util.NOP : lep.BaseControl.prototype.syncToMidi;
        // lep.logDev('{} is now {}', this.name, value ? 'MUTED' : 'UN-MUTED');
    }
});