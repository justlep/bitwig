/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseControl}
 */
lep.Button = lep.util.extendClass(lep.BaseControl, {
    /** @constructs */
    _init: function(opts) {
        this._super(opts);

        lep.util.assertNumber(opts.clickNote, 'Missing/invalid clickNote for Button {}', this.name);
        this.resyncOnClickRelease = (opts.resyncOnClickRelease !== false);
    },
    /** @override */
    onClickNotePressed: function() {
        if (this.value) {
            this.value.onAbsoluteValueReceived(127);
        }
    },
    /** @override */
    onClickNoteReleased: function() {
        if (this.value) {
            this.value.onAbsoluteValueReceived(0);
        }
        if (this.resyncOnClickRelease) {
            this.syncToMidi();
        }
    }
});
