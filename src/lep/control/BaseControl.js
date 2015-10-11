 /**
 * Represents a single control element of a MIDI hardware controller,
 * like a button, fader, encoder etc..
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.BaseControl = function(opts) {
    lep.util.assertString(opts.name, 'Missing name for BaseControl');
    lep.util.assert((!!opts.valueNote ^ !!opts.valueCC) || opts.clickNote,
        'BaseControl needs (valueCC xor valueNote) or clickNote');

    this.midiInPort = lep.util.limitToRange(opts.midiInPort||0, 0, 10);
    this.midiChannel = lep.util.limitToRange(opts.midiChannel||0, 0, 15);
    this.listeningMidiChannel = ((typeof opts.midiChannel === 'number') || null) && this.midiChannel;

    this.name = opts.name;
    this.value = null; // the BaseValue currently attached to this control (NOT the numerical midi value)

    this.valueNote = opts.valueNote || null;
    this.valueCC = opts.valueCC || null;

    this.sendsDiffValues = !!opts.sendsDiffValues;
    this.diffValueRange = opts.diffValueRange || lep.BaseControl.DIFF_VALUE_RANGE.NORMAL;

    this.clickNote = opts.clickNote || null;
    this.isClicked = false;

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
        lep.util.assertBaseValue(value, 'invalid value for BaseControl['+ this.name +'].attachValue()');
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
        if (this.valueNote) {
            sendNoteOn(this.midiChannel, this.valueNote, value);
        } else if (this.valueCC) {
            sendChannelController(this.midiChannel, this.valueCC, value);
        }
        if (this.clickNote && !this.valueNote && !this.valueCC) {
            // sending click note status only makes sense for LED-buttons, not for ClickEncoders
            sendNoteOn(this.midiChannel, this.clickNote, value);
        }
    },
    onValueReceived: function(noteOrCC, receivedValue) {
        if (!this.value) return;
        if (this.sendsDiffValues) {
            var delta = (receivedValue <= 64) ? receivedValue : (-1 * (128 - receivedValue));
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
        if (this.valueNote) {
            eventDispatcher.onNote(this.valueNote, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> note {} channel {}', this.name, this.valueNote, this.listeningMidiChannel);
        } else if (this.valueCC) {
            eventDispatcher.onCC(this.valueCC, this.onValueReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI bound: {} -> CC {} channel {}', this.name, this.valueCC, this.listeningMidiChannel);
        }
        if (this.clickNote) {
            eventDispatcher.onNote(this.clickNote, this.onClickNoteReceived, this, this.listeningMidiChannel);
            lep.logDebug('MIDI clickNote bound: {} -> CC {} channel {}', this.name, this.clickNote, this.listeningMidiChannel);
        }
    }
};
