/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.Button = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assertNumber(opts.clickNote, 'Missing/invalid clickNote for Button {}', this.name);
        this.resyncOnClickRelease = (opts.resyncOnClickRelease !== false);

        var self = this;
    },
    /** @Override */
    onClickNotePressed: function() {
        if (this.value) {
            this.value.onAbsoluteValueReceived(127);
        }
    },
    /** @Override */
    onClickNoteReleased: function() {
        if (this.value) {
            this.value.onAbsoluteValueReceived(0);
        }
        if (this.resyncOnClickRelease) {
            this.syncToMidi();
        }
    }
});