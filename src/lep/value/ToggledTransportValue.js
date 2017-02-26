/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * Represents one of the toggleable transport values, like isPlaying, metronome enable etc.
 * (!) Use the lep.ToggledTransportValue.getXXXXInstance getters to obtain instances
 *
 * @constructor
 */
lep.ToggledTransportValue = lep.util.extendClass(lep.BaseValue, {
    _init: function(opts) {
        this._super(opts);

        util.assert(!lep.ToggledTransportValue._instances[this.name], 'Must use lep.ToggledTransportValue.getXXXXInstance');
        lep.ToggledTransportValue._instances[this.name] = this;

        var self = this,
            transport = lep.util.getTransport(),
            settableBooleanProperty = transport[opts.booleanPropertyName],
            settableBoolean;

        lep.util.assertFunction(settableBooleanProperty, 'Missing settableBooleanProperty {} in Transport for {}',
            opts.booleanPropertyName, this.name);

        //println('typeof settableBooleanProperty: ' + typeof settableBooleanProperty);
        //println('typeof settableBooleanProperty.call: ' + typeof settableBooleanProperty.call);
        //println('typeof settableBooleanProperty.apply' + typeof settableBooleanProperty.apply);

        // TODO this crashes currently with a weird error:
        // Error starting driver: This cannot be called when specifying required API version 1:

        settableBoolean = settableBooleanProperty();

        this.toggleOnPressed = (opts.toggleOnPressed !== false);

        this.togglingMethod = function() {
            settableBoolean.toggle();
        };

        settableBoolean.addValueObserver(function(isOn) {
            self.value = isOn ? 127 : 0;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        if (this.toggleOnPressed ^ !!absoluteValue) return;
        this.togglingMethod();
    }
});

/** @static */
lep.ToggledTransportValue._instances = {};

// add static lep.ToggledTransportValue.getXXXInstance() methods...
(function(makeInstanceGetter) {

    lep.ToggledTransportValue.getPlayInstance = makeInstanceGetter('Play', 'isPlaying');
    lep.ToggledTransportValue.getMetronomeInstance = makeInstanceGetter('Metronome', 'isMetronomeTickPlaybackEnabled');
    lep.ToggledTransportValue.getRecordInstance = makeInstanceGetter('Record', 'isArrangerRecordEnabled');
    lep.ToggledTransportValue.getPunchInInstance = makeInstanceGetter('PunchIn', 'isPunchInEnabled');
    lep.ToggledTransportValue.getPunchOutInstance = makeInstanceGetter('PunchOut', 'isPunchOutEnabled');
    lep.ToggledTransportValue.getOverdubInstance = makeInstanceGetter('Overdub', 'isArrangerOverdubEnabled');
    lep.ToggledTransportValue.getLoopInstance = makeInstanceGetter('Loop', 'isArrangerLoopEnabled');
    lep.ToggledTransportValue.getArrangerAutomationInstance = makeInstanceGetter('ArrangerAutomation', 'isArrangerAutomationWriteEnabled');

})(function _makeInstanceGetter(instanceName, transportBooleanPropertyName) {
    lep.util.assertString(instanceName && transportBooleanPropertyName, 'Bad call of _makeInstanceGetter for ToggledTransportValue', instanceName);

    return function() {
        return lep.ToggledTransportValue._instances[instanceName] || new lep.ToggledTransportValue({
            name: instanceName,
            booleanPropertyName: transportBooleanPropertyName
        });
    };
});
