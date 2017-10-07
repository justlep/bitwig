/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * Represents one of the toggleable transport values, like isPlaying, metronome enable etc.
 * (!) Use the lep.ToggledTransportValue.getXXXXInstance getters to obtain instances
 *
 * @constructor
 */
lep.ToggledTransportValue = lep.util.extendClass(lep.BaseValue, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assert(!lep.ToggledTransportValue._instances[this.name], 'Must use lep.ToggledTransportValue.getXXXXInstance');
        lep.util.assertFunctionOrEmpty(opts.calculateVelocity, 'Invalid opts.calculateVelocity for {}', this.name);
        lep.ToggledTransportValue._instances[this.name] = this;

        var self = this,
            transport = lep.util.getTransport(),
            settableBoolean = transport[opts.booleanPropertyName](),
            calcVelocity = opts.calculateVelocity || null;

        lep.util.assert(settableBoolean, 'Invalid settableBoolean {} in Transport for {}',
            opts.booleanPropertyName, this.name);

        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.isOn = null;

        this.togglingMethod = function() {
            settableBoolean.toggle();
        };

        settableBoolean.addValueObserver(function(isOn) {
            self.isOn = isOn;
            self.value = calcVelocity ? calcVelocity(isOn) : isOn ? 127 : 0;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue /*, isTakeoverRequired */) {
        var isPressed = !!absoluteValue;
        if (this.toggleOnPressed === isPressed) {
            this.togglingMethod();
        }
    }
});

/** @static */
lep.ToggledTransportValue._instances = {};

// add static lep.ToggledTransportValue.getXXXInstance() methods...
(function(makeInstanceGetter) {

    lep.ToggledTransportValue.getPlayInstance = makeInstanceGetter('Play', 'isPlaying');
    lep.ToggledTransportValue.getMetronomeInstance = makeInstanceGetter('Metronome', 'isMetronomeEnabled');
    lep.ToggledTransportValue.getRecordInstance = makeInstanceGetter('Record', 'isArrangerRecordEnabled');
    lep.ToggledTransportValue.getPunchInInstance = makeInstanceGetter('PunchIn', 'isPunchInEnabled');
    lep.ToggledTransportValue.getPunchOutInstance = makeInstanceGetter('PunchOut', 'isPunchOutEnabled');
    lep.ToggledTransportValue.getOverdubInstance = makeInstanceGetter('Overdub', 'isArrangerOverdubEnabled');
    lep.ToggledTransportValue.getLoopInstance = makeInstanceGetter('Loop', 'isArrangerLoopEnabled');
    lep.ToggledTransportValue.getArrangerAutomationInstance = makeInstanceGetter('ArrangerAutomation', 'isArrangerAutomationWriteEnabled');

})(function _makeInstanceGetter(instanceName, transportBooleanPropertyName) {
    lep.util.assertString(instanceName && transportBooleanPropertyName,
        'Bad call of _makeInstanceGetter for ToggledTransportValue, instanceName = {}', instanceName);

    return function(optCalcVelocityFn) {
        return lep.ToggledTransportValue._instances[instanceName] || new lep.ToggledTransportValue({
            name: instanceName,
            booleanPropertyName: transportBooleanPropertyName,
            calculateVelocity: optCalcVelocityFn
        });
    };
});
