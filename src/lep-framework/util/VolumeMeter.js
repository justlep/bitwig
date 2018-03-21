/**
 * Represents a set of VU meter values that will be synced to a MIDI device' LEDs
 * by "hijacking" an existing {@link ControlSet}'s controls feedback midi CC/note or using deviating value.
 * In any case, the ControlSet will be restored after the VU meter is disabled, by re-syncing it's controls to the device.
 *
 * @param {Object} opts
 * @param {lep.ControlSet} opts.overloadControlSet
 * @param {lep.TracksView} opts.tracksView
 * @param {number} [opts.midiChannel]
 * @param {number} [opts.midiStartNote]
 * @param {number} [opts.midiStartCC]
 * @param {number} [opts.maxMidiValue=127] - optionally a max value to be sent to the device, e.g. some ring LEDs allow only values 1..x
 * @param {boolean} [opts.usePeak=false] - if true, the peak value is measured. Default is RMS.
 *
 * @constructor
 */
lep.VolumeMeter = function(opts) {
    this.name = 'VolumeMeter' + lep.VolumeMeter._instances.push(this);

    var self = this,
        controlSet = opts.overloadControlSet,
        tracksView = opts.tracksView,
        midiChannel = (typeof opts.midiChannel !== 'undefined' ? opts.midiChannel : controlSet.controls[0].midiChannel4Sync),
        midiStartNote = (typeof opts.midiStartNote !== 'undefined' ? opts.midiStartNote : controlSet.controls[0].valueNote4Sync),
        useMidiNote = (typeof midiStartNote === 'number'),
        midiStartCC = (typeof opts.midiStartCC !== 'undefined' ? opts.midiStartCC : controlSet.controls[0].valueCC4Sync),
        useMidiCC = (typeof midiStartCC === 'number'),
        maxMidiValue = opts.maxMidiValue || 127,
        usePeak = opts.usePeak,
        _isEnabled = false;

    lep.util.assert(controlSet instanceof lep.ControlSet, 'Invalid overloadControlSet for {}: {}', this.name, controlSet);
    lep.util.assert(tracksView instanceof lep.TracksView, 'Invalid tracksView for {}: {}', this.name, tracksView);
    lep.util.assertNumberInRange(midiChannel, 0, 15, 'Invalid midiChannel {} for {}', midiChannel, this.name);
    lep.util.assertNumberInRange(maxMidiValue, 0, 127, 'Invalid maxMidiValue "{}" for {}', maxMidiValue, this.name);
    lep.util.assert(tracksView.tracks.length <= controlSet.controls.length, 'ControlSet {} is too small for {}. Required: {}+, actual: {}',
                    controlSet.name, this.name, tracksView.tracks.length, controlSet.controls.length);

    if (useMidiNote) {
        lep.util.assertNumberInRange(midiStartNote, 0, 127, 'Invalid midiStartNote {} for {}', midiStartNote, this.name);
    } else if (useMidiCC) {
        lep.util.assertNumberInRange(midiStartCC, 0, 127, 'Invalid midiStartCC {} for {}', midiStartCC, this.name);
    } else {
        lep.util.assert(false, 'Neither note nor CC defined for {}', this.name);
    }

    tracksView.tracks.forEach(function(track, i) {
        var valueScale = maxMidiValue + 1,
            channel = midiChannel,
            midiByte0 = (useMidiNote ? 0x90 : 0xB0) | channel,
            midiByte1 = (useMidiNote ? midiStartNote : midiStartCC) + i,
            outPort = host.getMidiOutPort(0);

        track.addVuMeterObserver(valueScale, -1, usePeak, function(scaledValue) {
            // FIXME scaledValue is expected in [0..127] but sometimes is 128 in Bitwig 2.3.2; remove the bounds-check when bug is fixed
            _isEnabled && outPort.sendMidi(midiByte0, midiByte1, scaledValue < 128 ? scaledValue : 127);
        });
    });


    this.isEnabled = ko.observable(false).extend({toggleable: true});

    this.isEnabled.subscribe(function(enabled) {
        _isEnabled = enabled;

        if (enabled) {
            lep.logDebug('{} is ENABLED', self.name);
        } else {
            lep.logDebug('{} is DISABLED', self.name);
            // Restore total control over LED back to the controlset..
            controlSet.forceSyncToMidi();
        }
    });
};

lep.VolumeMeter._instances = [];