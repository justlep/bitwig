/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * Represents one of the toggleable transport values, like isPlaying, metronome enable etc.
 * (!) Use {@link lep.ToggledTransportValue.create} for instantiation.
 *
 * @constructor
 */
lep.ToggledTransportValue = lep.util.extendClass(lep.BaseValue, {
    _init: function(opts) {
        this._super(opts);

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
lep.ToggledTransportValue.NAME_TO_SETTABLE_BOOLEAN_NAME_MAP = {
    Metronome: 'isMetronomeTickPlaybackEnabled',
    Play: 'isPlaying',
    Record: 'isArrangerRecordEnabled',
    PunchIn: 'isPunchInEnabled',
    PunchOut: 'isPunchOutEnabled',
    Overdub: 'isArrangerOverdubEnabled',
    Loop: 'isArrangerLoopEnabled',
    ArrangerAutomation: 'isArrangerAutomationWriteEnabled'
};

/**
 * @static
 * Creates a new ToggledTransportValue for one of the types defined in {@link #NAME_TO_SETTABLE_BOOLEAN_NAME_MAP}
 * @param name (String) one of the keys of {@link #NAME_TO_SETTABLE_BOOLEAN_NAME_MAP}
 * @returns {lep.ToggledTransportValue}
 */
lep.ToggledTransportValue.create = function(name) {
    var booleanPropertyName = lep.ToggledTransportValue.NAME_TO_SETTABLE_BOOLEAN_NAME_MAP[name];
    lep.util.assertString(booleanPropertyName, 'Unsupported name for ToggledTransportValue: ' + name);
    return new lep.ToggledTransportValue({
        name: name,
        booleanPropertyName: booleanPropertyName
    });
};