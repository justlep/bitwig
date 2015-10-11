/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.Button = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assertNumber(opts.clickNote, 'Missing/invalid clickNote for Button');
        this.resyncOnClickRelease = (opts.resyncOnClickRelease !== false);

        var self = this;

        if (opts.valueToAttach) {
            if (ko.isObservable(opts.valueToAttach)) {
                this.attachValue(opts.valueToAttach());
                opts.valueToAttach.subscribe(function(newValueToAttach) {
                    lep.util.assertBaseValue(newValueToAttach, 'Invalid newValueToAttach in observable of Button {}', this.name);
                    self.attachValue(newValueToAttach);
                });
            } else {
                this.attachValue(opts.valueToAttach);
            }
        }
    },
    /** @Override */
    onClickNotePressed: function() {
        if (this.value) {
            this.value.onAbsoluteValueReceived(128);
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