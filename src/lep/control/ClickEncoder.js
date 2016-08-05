/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)

 * @constructor
 */
lep.ClickEncoder = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assertNumber(opts.clickNote, 'Missing/invalid clickNote for ClickEncoder {}', this.name);

        this.resyncOnClickRelease = (opts.resyncOnClickRelease!==false);
        this.sendsDiffValues = (opts.sendsDiffValues!==false);
    },
    /** @Override */
    onClickNotePressed: function() {
        if (this.sendsDiffValues) {
            this.setDiffValueRangeFine(true);
        }
    },
    /** @Override */
    onClickNoteReleased: function() {
        if (this.sendsDiffValues) {
            this.setDiffValueRangeFine(false);
        }
        if (this.resyncOnClickRelease) {
            this.syncToMidi();
        }
    }
});
