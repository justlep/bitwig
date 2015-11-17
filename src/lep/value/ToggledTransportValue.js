/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ToggledTransportValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assertString(opts.togglingMethodName, 'Missing togglingMethodName for ToggledTransportValue {}', this.name);
        lep.util.assertString(opts.observerAdderMethodName, 'Missing observerAdderMethodName for ToggledTransportValue {}', this.name);

        var self = this,
            transport = lep.util.getTransport(),
            togglingMethod = transport[opts.togglingMethodName],
            observerAdderMethod = transport[opts.observerAdderMethodName];

        lep.util.assertFunction(togglingMethod, 'Missing Bitwig API method: Transport.{}', opts.togglingMethodName);
        lep.util.assertFunction(observerAdderMethod, 'Missing Bitwig API method: Transport.{}', opts.observerAdderMethodName);

        this.togglingMethod = lep.util.bind(togglingMethod, transport);
        this.toggleOnPressed = (opts.toggleOnPressed !== false);

        observerAdderMethod.call(transport, function(on) {
            self.value = on ? 127 : 0;
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
lep.ToggledTransportValue.NAME_TO_TRANSPORT_METHODS_MAP = {
    Metronome: ['toggleClick','addClickObserver'],
    Play: ['togglePlay','addIsPlayingObserver'],
    Record: ['record','addIsRecordingObserver'],
    PunchIn: ['togglePunchIn', 'addPunchInObserver'],
    PunchOut: ['togglePunchOut', 'addPunchOutObserver'],
    Overdub: ['toggleOverdub', 'addOverdubObserver'],
    Loop: ['toggleLoop', 'addIsLoopActiveObserver'],
    ArrangerAutomation: ['toggleWriteArrangerAutomation','addIsWritingArrangerAutomationObserver']
};

/**
 * @static
 * Creates a new ToggledTransportValue for one of the types defined in {@link #NAME_TO_TRANSPORT_METHODS_MAP}
 * @param name (String) one of the keys of {@link #NAME_TO_TRANSPORT_METHODS_MAP}
 * @returns {lep.ToggledTransportValue}
 */
lep.ToggledTransportValue.create = function(name) {
    lep.util.assertArray(lep.ToggledTransportValue.NAME_TO_TRANSPORT_METHODS_MAP[name],
                         'Unsupported name for ToggledTransportValue: ' + name);
    return new lep.ToggledTransportValue({
        name: name,
        togglingMethodName: lep.ToggledTransportValue.NAME_TO_TRANSPORT_METHODS_MAP[name][0],
        observerAdderMethodName: lep.ToggledTransportValue.NAME_TO_TRANSPORT_METHODS_MAP[name][1]
    });
};