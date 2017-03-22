/**
 * Arturia Beatstep Pro with either just the main inputs shown (S1, S2, DRUM, ALL) or inputs for all channels.
 * @param [mainChannelsOnly] (boolean) if true, only the main inputs are provided
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)

 * @constructor
 */
function BeatstepPro(mainChannelsOnly) {
    var CC = {
            ENCODERS: [10,74,71,76,77,93,73,75,114,18,19,16,17,91,79,72],
            PATTERN_BTN: [20,21,22,23,24,25,26,27,28,29,30,31,52,53,54,55]
        },
        NUMBER_OF_ENCODERS = 16,
        INPUT_NAMES = {
            'null': 'ALL',
            1: 'S1',
            2: 'S2',
            10: 'DRUM'
        },
        // 1-based midi channels
        ORDERED_CHANNELS = mainChannelsOnly ? [1, 2, 10, null] : [1, 2, 10, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, null],
        USER_CONTROL_CHANNELS = [1];

    // create note inputs..
    for (var i = 0, noteChannel, zeroBasedNoteChannel, inputName; i < ORDERED_CHANNELS.length; i++) {
        noteChannel = ORDERED_CHANNELS[i];
        zeroBasedNoteChannel = (typeof noteChannel === 'number') ? (noteChannel - 1) : null;
        inputName = INPUT_NAMES[noteChannel] || noteChannel;
        lep.MidiEventDispatcher.getInstance().createNoteInput(''+inputName, zeroBasedNoteChannel);
    }

    // create user controls..
    for (var j = 0, channel, controlSet, userControls; j < USER_CONTROL_CHANNELS.length; j++) {
        channel = USER_CONTROL_CHANNELS[j];

        // Create UserControls for Rotary Encoders..
        controlSet = new lep.ControlSet('BSP Encoders CH' + channel, NUMBER_OF_ENCODERS, function(encoderIndex) {
            return new lep.Encoder({
                name: lep.util.formatString('BSP Enc {}|{}', channel, encoderIndex),
                midiChannel: channel,
                valueCC: CC.ENCODERS[encoderIndex],
                sendsDiffValues: false,
                isMuted: true // BSP is too stupid for MIDI feedback, anyway
            });
        });
        userControls = host.createUserControls(NUMBER_OF_ENCODERS);
        controlSet.setValueSet(new lep.ValueSet('EncoderValues CH' + channel, 1, NUMBER_OF_ENCODERS, function(valueIndex) {
            var userControlName = lep.util.formatString('BSP-Enc-UC{}|{}', channel, valueIndex);
            return lep.StandardRangedValue.createUserControlValue(userControls, valueIndex, userControlName);
        }));

        // Create UserControls for Pattern buttons..
        controlSet = new lep.ControlSet('BSP Pattern Buttons CH' + channel, NUMBER_OF_ENCODERS, function(buttonIndex) {
            return new lep.BaseControl({
                name: lep.util.formatString('BSP Pattern Button {}|{}', channel, buttonIndex),
                midiChannel: channel,
                valueCC: CC.PATTERN_BTN[buttonIndex],
                isMuted: true // BSP is too stupid for MIDI feedback, anyway
            });
        });
        userControls = host.createUserControls(NUMBER_OF_ENCODERS);
        controlSet.setValueSet(new lep.ValueSet('PatternBtnValues CH' + channel, 1, NUMBER_OF_ENCODERS, function(valueIndex) {
            var userControlName = lep.util.formatString('BSP-Ptn-UC{}|{}', channel, valueIndex);
            return lep.StandardRangedValue.createUserControlValue(userControls, valueIndex, userControlName);
        }));
    }
}

/** @static */
BeatstepPro.getInstanceForMainChannels = function() {
    return new BeatstepPro(true);
};

/** @static */
BeatstepPro.getInstanceForAllChannels = function() {
    return new BeatstepPro(false);
};
