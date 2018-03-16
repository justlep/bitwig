/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseControl}
 */
lep.ClickEncoder = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assertNumber(opts.clickNote, 'Missing/invalid clickNote for ClickEncoder {}', this.name);

        this.resyncOnClickRelease = (opts.resyncOnClickRelease !== false);
        this.sendsDiffValues = (opts.sendsDiffValues !== false);

        if (opts.skipResetOnDoubleClick) {
            this.onClickNoteDoublePressed = null;
        }
    },
    /** @override */
    onClickNoteDoublePressed: function() {
        if (this.value) {
            this.value.resetToDefault();
        }
    },
    /** @override */
    onClickNotePressed: function() {
        if (this.sendsDiffValues) {
            this.setDiffValueRangeFine(true);
        }
    },
    /** @override */
    onClickNoteReleased: function() {
        if (this.sendsDiffValues) {
            this.setDiffValueRangeFine(false);
        }
        if (this.resyncOnClickRelease) {
            this.syncToMidi();
        }
    }
});
