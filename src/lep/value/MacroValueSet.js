/**
 * @constructor
 */
lep.MacroValueSet = lep.util.extendClass(lep.ValueSet, {

    _init: function(cursorDevice) {
        lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for MacroValueSet');
        this._super('MacroValueSet', 1, 8, function (macroIndex) {
            return lep.StandardRangedValue.createMacroValue(cursorDevice, macroIndex);
        });

        var self = this;

        this.deviceName = ko.observable('');

        cursorDevice.addNameObserver(50, 'unknown device', function(deviceName) {
            self.deviceName(deviceName);
        });

        /** @Override */
        this.dynamicId = ko.computed(function() {
            return '' + self.id + '_' + self.name + '__' + self.deviceName();
        });
    }

});