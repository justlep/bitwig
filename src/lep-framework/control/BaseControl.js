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
    lep.util.assertNumberInRange(this.feedbackValueCorrectionMultiplier, 0, 0.999999999,
        'Invalid feedbackValueCorrectionMultiplier "{}" for {}, based on minFeedbackValue={}, maxFeedbackValue={}',
        this.feedbackValueCorrectionMultiplier, this.name, this.minFeedbackValue, this.maxFeedbackValue
    );

    this.isMuted = !!opts.isMuted;
    this.isUnidirectional = !!opts.isUnidirectional;
    if (this.isUnidirectional) {
        // since unidirectional controls have no use for the syncToMidi(), we can replace it with a nop
        this.syncToMidi = lep.util.NOP;
    }
    this.isBidirectional = !this.isUnidirectional; // redundant flag to save constant negations

    // the latest absolute value received from the controller that might be
    // skipped (and reset) during the next syncToMidi() if skipFeedbackLoops is not explicitly disabled
    this.nextFeedbackLoopValue = null;
    this.skipFeedbackLoops = !this.sendsDiffValues && !this.feedbackValueCorrectionMultiplier && opts.skipFeedbackLoops !== false;
    
    if (this.isBidirectional) {
        this.midiChannel4Sync = (typeof opts.midiChannel4Sync === 'number') ? opts.midiChannel4Sync : this.midiChannel;
        this.valueNote4Sync = (this.useValueNote && typeof opts.valueNote4Sync === 'number') ? opts.valueNote4Sync : this.valueNote;
        this.valueCC4Sync = (this.useValueCC && typeof opts.valueCC4Sync === 'number') ? opts.valueCC4Sync : this.valueCC;
        this.clickNote4Sync = (this.useClickNote && typeof opts.clickNote4Sync === 'number') ? opts.clickNote4Sync : this.clickNote;
        lep.util.assertNumberInRange(this.midiChannel4Sync, 0, 15, 'Invalid midiChannel4Sync {} for {}', this.midiChannel4Sync, this.name);
        lep.util.assertNumberInRangeOrEmpty(this.valueNote4Sync, 0, 127, 'Invalid valueNote4Sync {} for {}', this.valueNote4Sync, this.name);
        lep.util.assertNumberInRangeOrEmpty(this.valueCC4Sync,   0, 127, 'Invalid valueCC4Sync {} for {}', this.valueCC4Sync, this.name);
        lep.util.assertNumberInRangeOrEmpty(this.clickNote4Sync, 0, 127, 'Invalid clickNote4Sync {} for {}', this.clickNote4Sync, this.name);

        // disable feedback-loop-prevention for asymmetric midi sync
        this.skipFeedbackLoops = this.skipFeedbackLoops && 
                                 this.midiChannel === this.midiChannel4Sync &&
                                 this.valueNote4Sync === this.valueNote &&
                                 this.valueCC4Sync === this.valueCC &&
                                 this.clickNote4Sync === this.clickNote;

        lep.logDebug('Feedback-loop-prevention for {} is {}', this.name, this.skipFeedbackLoops ? 'ENABLED' : 'DISABLED');
    }

    this.bindMidiValueListener();

    if (opts.valueToAttach) {
        if (ko.isObservable(opts.valueToAttach)) {
            this.attachValue(opts.valueToAttach());
            opts.valueToAttach.subscribe(function(newValueToAttach) {
                lep.util.assertBaseValue(newValueToAttach, 'Invalid newValueToAttach in observable of BaseControl {}', this.name);
                this.attachValue(newValueToAttach);
            }, this);
        } else {
            this.attachValue(opts.valueToAttach);
        }
    }
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
    /**
     * @param {boolean} isMuted
     */
    setMuted: function(isMuted) {
        this.isMuted = isMuted;
        this.nextFeedbackLoopValue = null;
        if (!isMuted) {
            this.syncToMidi();
        }
    },
    /**
     * @param {lep.BaseValue} value
     */
    attachValue: function(value) {
        lep.util.assertBaseValue(value, 'invalid value for BaseControl<{}>.attachValue()', this.name);
        this.nextFeedbackLoopValue = null;
        if (value === this.value) {
            return;
        } else if (value.controller && value.controller !== this) {
            value.controller.detachValue();
        } else {
            this.detachValue();
        }
        this.value = value;
        value.afterAttach(this);
    },
    detachValue: function() {
        this.nextFeedbackLoopValue = null;
        if (this.value) {
            this.value.onDetach();
            this.value = null;
        }
    },
    /**
     * Sends the BaseValue's numerical value (or an explicitely given value) to the device.
     * @param {number} [valueOverride] - optional value to send instead of the BaseValue's value
     */
    syncToMidi: function(valueOverride) {
        if (this.isMuted || this.isUnidirectional || (!this.value && !arguments.length)) {
            return;
        }

        var useOverride = !!arguments.length,
            valueToSend = useOverride ? valueOverride : (this.value.value || 0),
            skipSync = false;

        if (useOverride) {
            lep.util.assertNumberInRange(valueOverride, 0, 127, 'Invalid valueOverride {} for {}', valueOverride, this.name);
        } else {
            skipSync = this.skipFeedbackLoops && (this.nextFeedbackLoopValue === valueToSend);
            this.nextFeedbackLoopValue = null;
            if (skipSync) {
                // println('Skipping syncToMidi(' + valueToSend + ') of ' + this.name);
                return;
            }
        }

        if (this.feedbackValueCorrectionMultiplier) {
            valueToSend = this.minFeedbackValue + Math.round(valueToSend * this.feedbackValueCorrectionMultiplier);
        }

        if (this.useValueNote) {
            sendNoteOn(this.midiChannel4Sync, this.valueNote4Sync, valueToSend);
        } else if (this.useValueCC) {
            sendChannelController(this.midiChannel4Sync, this.valueCC4Sync, valueToSend);
        } else if (this.useClickNote) {
            // sending click note status only makes sense for LED-buttons, not for ClickEncoders
            sendNoteOn(this.midiChannel4Sync, this.clickNote4Sync, valueToSend);
        }
    },
    /**
     * @param {number} noteOrCC
     * @param {number} receivedValue
     */
    onValueReceived: function(noteOrCC, receivedValue) {
        if (!this.value) {
            return;
        }
        if (this.sendsDiffValues) {
            var delta = (this.diffZeroValue) ? (receivedValue - this.diffZeroValue) :
                                               (receivedValue <= 64) ? receivedValue : (-1 * (128 - receivedValue));
            this.value.onRelativeValueReceived(delta, this.diffValueRange);
        } else {
            this.nextFeedbackLoopValue = receivedValue;
            this.value.onAbsoluteValueReceived(receivedValue, this.isUnidirectional);
        }
    },
    /**
     * @param {number} clickNote
     * @param {number} receivedValue
     */
    onClickNoteReceived: function(clickNote, receivedValue) {
        this.isClicked = !!receivedValue;

        if (this.isClicked) {
            this.onClickNotePressed();
        } else {
            this.onClickNoteReleased();
        }
    },
    bindMidiValueListener: function() {
        var eventDispatcher = lep.MidiEventDispatcher.getInstance(this.midiInPort);
        if (this.useValueNote) {
            eventDispatcher.onNote(this.valueNote, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> note {}, CH{}', this.name, this.valueNote, this.listeningMidiChannel);
        } else if (this.useValueCC) {
            eventDispatcher.onCC(this.valueCC, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> CC {} CH{}', this.name, this.valueCC, this.listeningMidiChannel);
        }
        if (this.useClickNote) {
            eventDispatcher.onNote(this.clickNote, this.onClickNoteReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI clickNote bound: {} -> note {} CH{}', this.name, this.clickNote, this.listeningMidiChannel);
        }
    }
};
