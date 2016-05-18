/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.MorphWeightValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(index, morphFn, isEnabledObservable) {
        lep.util.assertNumberInRange(index, 0, 8, 'Invalid index for lep.MorphWeightValue');
        lep.util.assertFunction(morphFn, 'Invalid morphFn for lep.MorphWeightValue');
        lep.util.assertObservable(isEnabledObservable, 'Invalid isEnabledObservable for lep.MorphWeightValue');

        this._super({
            name: 'MorphWeight' + index
        });

        var self = this;

        this.useForMorph = false;

        ko.computed(function(){
            self.useForMorph = !!isEnabledObservable();
            // bind morphFn or NOP directly to 'this.syncToDaw' (for efficiency)
            self.syncToDaw = self.useForMorph ? morphFn : lep.util.NOP;
        })(); // TODO re-check if () is necessary.. computables should run intitially by default, anyway
    },
    setValue: function(newValue, syncOnlyIfDifferent) {
        lep.util.assertNumberInRange(newValue, 0, 127, 'invalid newValue {} for MorphWeightValue.setValue', newValue);
        if (this.value === newValue && syncOnlyIfDifferent) return;
        this.value = newValue;
        this.syncToController();
    },
    onRelativeValueReceived: function(delta, range) {
        lep.logDebug('MorphWeightValue.onRelativeChange({},{})', delta, range);
        var newAbsValueUnchecked = Math.round(this.value + ((delta * 128) / range)),
            checkedValue = lep.util.limitToRange(newAbsValueUnchecked, 0, 127);
        this.onAbsoluteValueReceived(checkedValue, 128);
    }
});
