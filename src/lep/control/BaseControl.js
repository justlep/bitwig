 /**
 * Represents a single control element of a MIDI hardware controller,
 * like a button, fader, encoder etc..
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.BaseControl = function(opts) {
    lep.util.assertString(opts.name, 'Missing name for BaseControl');

    this.name = opts.name;

    this.useValueNote = (typeof opts.valueNote === 'number');
    this.useValueCC = (typeof opts.valueCC === 'number');
    this.useClickNote = (typeof opts.clickNote === 'number');

    this.valueNote = this.useValueNote ? opts.valueNote : null;
    this.valueCC = this.useValueCC ? opts.valueCC : null;
    this.clickNote = this.useClickNote ? opts.clickNote : null;

    lep.util.assert((this.useValueNote !== this.useValueCC) || (!this.useValueNote && !this.useValueCC && this.useClickNote),
        'Invalid combination of valueNote|valueCC|clickNote for {}\nGiven: valueNote={}, valueCC={}, clickNote={}',
        this.name, this.valueNote, this.valueCC, this.clickNote);

    lep.util.assertNumberInRangeOrEmpty(this.valueNote, 0, 127, 'Invalid valueNote {} for {}', this.valueNote, this.name);
    lep.util.assertNumberInRangeOrEmpty(this.valueCC,   0, 127, 'Invalid valueCC {} for {}', this.valueCC, this.name);
    lep.util.assertNumberInRangeOrEmpty(this.clickNote, 0, 127, 'Invalid clickNote {} for {}', this.clickNote, this.name);

    this.midiInPort = lep.util.limitToRange(opts.midiInPort||0, 0, 10);
    this.midiChannel = lep.util.limitToRange(opts.midiChannel||0, 0, 15);
    this.listeningMidiChannel = ((typeof opts.midiChannel === 'number') || null) && this.midiChannel;

    this.value = null; // the BaseValue currently attached to this control (NOT the numerical midi value)

    this.isClicked = false;

    this.sendsDiffValues = !!opts.sendsDiffValues;
    this.diffValueRange = opts.diffValueRange || lep.BaseControl.DIFF_VALUE_RANGE.NORMAL;
    this.diffZeroValue = opts.diffZeroValue || 0;

    // optional min/max value range for value sent back to the controller;
    // e.g. for Behringer CMD series encoders whose LED circles expect values from 1 to 15, not 0 to 127 as on the BCF2000
    lep.util.assertNumberInRangeOrEmpty(opts.minFeedbackValue, 0, 127, 'Invalid minFeedbackValue {} for {}', opts.minFeedbackValue, opts.name);
    lep.util.assertNumberInRangeOrEmpty(opts.maxFeedbackValue, 0, 127, 'Invalid maxFeedbackValue {} for {}', opts.maxFeedbackValue, opts.name);
    this.minFeedbackValue = opts.minFeedbackValue || 0;
    this.maxFeedbackValue = opts.maxFeedbackValue || 0;
    this.feedbackValueCorrectionMultiplier = (this.maxFeedbackValue - this.minFeedbackValue) / 127;

    this.isMuted = !!opts.isMuted;

    this.bindMidiValueListener();
};

/** @static */
lep.BaseControl.DIFF_VALUE_RANGE = {
    NORMAL: 128,
    FINE: 4 * 128
};

lep.BaseControl.prototype = {
    onClickNotePressed: lep.util.NOP,
    onClickNoteReleased: lep.util.NOP,

    setDiffValueRangeFine: function(useFine) {
        this.diffValueRange = useFine ? lep.BaseControl.DIFF_VALUE_RANGE.FINE : lep.BaseControl.DIFF_VALUE_RANGE.NORMAL;
    },
    setMuted: function(isMuted) {
        this.isMuted = isMuted;
        if (!isMuted) {
            this.syncToMidi();
        }
    },
    attachValue: function(value) {
        lep.util.assertBaseValue(value, 'invalid value for BaseControl<{}>.attachValue()', this.name);
        if (value === this.value) {
            return;
        } else if (value.controller && value.controller !== this) {
            value.controller.detachValue();
        } else {
            this.detachValue();
        }
        this.value = value;
        value.onAttach(this);
    },
    detachValue: function() {
        if (this.value) {
            this.value.onDetach();
            this.value = null;
        }
    },
    /**
     * Sends the BaseValue's numerical value (or an explicitely given value) to the device.
     * @param [valueOverride] (Number) optional value to send instead of the BaseValue's value
     */
    syncToMidi: function(valueOverride) {
        if (this.isMuted || (!this.value && !arguments.length)) return;
        if (arguments.length) {
            lep.util.assertNumberInRange(valueOverride, 0, 127, 'Invalid valueOverride {} for {}', valueOverride, this.name);
        }
        var value = (arguments.length) ? valueOverride : (this.value.value || 0);
        if (this.feedbackValueCorrectionMultiplier) {
            value = this.minFeedbackValue + Math.round(value * this.feedbackValueCorrectionMultiplier);
        }

        if (this.useValueNote) {
            sendNoteOn(this.midiChannel, this.valueNote, value);
        } else if (this.useValueCC) {
            sendChannelController(this.midiChannel, this.valueCC, value);
        }
        if (this.useClickNote && !this.useValueNote && !this.useValueCC) {
            // sending click note status only makes sense for LED-buttons, not for ClickEncoders
            sendNoteOn(this.midiChannel, this.clickNote, value);
        }
    },
    onValueReceived: function(noteOrCC, receivedValue) {
        if (!this.value) return;
        if (this.sendsDiffValues) {
            var delta = (this.diffZeroValue) ? (receivedValue - this.diffZeroValue) :
                                               (receivedValue <= 64) ? receivedValue : (-1 * (128 - receivedValue));
            this.value.onRelativeValueReceived(delta, this.diffValueRange);
        } else {
            this.value.onAbsoluteValueReceived(receivedValue);
        }
    },
    onClickNoteReceived: function(clickNote, receivedValue) {
        this.isClicked = !!receivedValue;

        if (this.isClicked) {
            this.onClickNotePressed();
        } else {
            this.onClickNoteReleased();
        }
    },
    bindMidiValueListener: function() {
        var eventDispatcher = lep.MidiEventDispatcher.getInstance({midiInPort: this.midiInPort});
        if (this.useValueNote) {
            eventDispatcher.onNote(this.valueNote, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> note {} channel {}', this.name, this.valueNote, this.listeningMidiChannel);
        } else if (this.useValueCC) {
            eventDispatcher.onCC(this.valueCC, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> CC {} channel {}', this.name, this.valueCC, this.listeningMidiChannel);
        }
        if (this.useClickNote) {
            eventDispatcher.onNote(this.clickNote, this.onClickNoteReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI clickNote bound: {} -> note {} channel {}', this.name, this.clickNote, this.listeningMidiChannel);
        }
    }
};
