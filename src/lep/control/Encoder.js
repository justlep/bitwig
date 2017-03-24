/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.Encoder = lep.util.extendClass(lep.BaseControl, {
    _init: function(opts) {
        this._super(opts);

        this.sendsDiffValues = (opts.sendsDiffValues!==false);
    }
});