/**
 * Bitwig Controller Script for the Behringer CMD DC-1.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);
load('lep/api.js');

// @deprecationChecked:1.3.5
host.defineController('Behringer', 'CMD DC-1 (LeP)', '1.0', '047f0d84-8ace-11e5-af63-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['CMD DC-1'], ['CMD DC-1']);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEV);
    new lep.DC1();
}

/**
 * @constructor
 */
lep.DC1 = function() {

    var MIDI_CHANNEL = 5,
        MIDI_CHANNEL_FOR_PROGRAM_CHANGE = 0,
        NOTE = {
            PUSH_ENCODER_CLICK: 32,
            FIRST_TOP_BUTTON: 0, // ascending left-to-right, top-to-bottom; i.e. second row starting with 4
            FIRST_NUM_BUTTON: 16,
            PAD1: 36
        },
        CC = {
            PUSH_ENCODER: 32,
            FIRST_ENCODER: 16
        },
        /**
         * Button color velocities. Push encoder color can not be changed.
         * Lights can't be turned off completely :(
         */
        COLOR = {
            ORANGE: 0,
            BLUE: 1,
            BLUE_BLINK: 2
        },
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        noteInput = eventDispatcher.createNoteInput('DC-1', MIDI_CHANNEL_FOR_PROGRAM_CHANGE, true),
        currentBank = ko.observable(0).extend({notify: 'always'}),
        currentPreset = ko.observable(0).extend({notify: 'always'}),
        pushEncoderTarget = ko.observable(),
        bankOrPresetPageIndex = ko.computed(function() {
            var targetObservable = pushEncoderTarget(),
                isBankOrPresetMode = (targetObservable === currentBank || targetObservable === currentPreset),
                pageIndex = (isBankOrPresetMode) ? Math.floor(targetObservable() / 16) : -1;

            return pageIndex;
        }),
        bankOrPresetPadIndex = ko.computed(function() {
            var targetObservable = pushEncoderTarget(),
                isBankOrPresetMode = (targetObservable === currentBank || targetObservable === currentPreset),
                padIndex = (isBankOrPresetMode) ? Math.floor(targetObservable() % 16) : -1;

            lep.logDebug('padIndex: ' + padIndex);
            return padIndex;
        });


    // Bank Mode Button
    (new lep.Button({
        midiChannel: MIDI_CHANNEL,
        name: 'BankModeButton',
        clickNote: NOTE.FIRST_TOP_BUTTON + 4,
        valueToAttach: new lep.KnockoutSyncedValue({
            name: 'BankModeValue',
            ownValue: currentBank,
            refObservable: pushEncoderTarget,
            velocityValueOn: COLOR.BLUE,
            velocityValueOff: COLOR.ORANGE
        })
    }));

    // Preset Mode Button
    (new lep.Button({
        midiChannel: MIDI_CHANNEL,
        name: 'PresetModeButton',
        clickNote: NOTE.FIRST_TOP_BUTTON + 5,
        valueToAttach: new lep.KnockoutSyncedValue({
            name: 'PresetModeValue',
            ownValue: currentPreset,
            refObservable: pushEncoderTarget,
            velocityValueOn: COLOR.BLUE,
            velocityValueOff: COLOR.ORANGE
        })
    }));

    // Make 'click' on push encoder reset the bank and/or preset..
    eventDispatcher.onNote(NOTE.PUSH_ENCODER_CLICK, function(note, value, channel) {
        var targetObservable = pushEncoderTarget(),
            isBankMode = (targetObservable === currentBank),
            isPresetMode = (targetObservable === currentPreset);

        if (isBankMode) {
            currentBank(0);
        }
        if (isPresetMode || isBankMode) {
            currentPreset(0);
        }
    });

    // Bind 'twisting' events for the push encoder..
    eventDispatcher.onCC(CC.PUSH_ENCODER, function(cc, value, channel){
        var targetObservable = pushEncoderTarget(),
            isBankMode = (targetObservable === currentBank),
            isPresetMode = (targetObservable === currentPreset),
            diff = (value - 64);

        if (isBankMode || isPresetMode) {
            var newBankOrPreset = lep.util.limitToRange(targetObservable() + diff, 0, 127);
            targetObservable(newBankOrPreset);
            if (isBankMode) {
                // changing the bank switches to that bank's first preset
                currentPreset(0);
            }
        }
    });

    (function() {
        var isReady = false;
        // Send MIDI ProgramChange (and bank change) messages when bank or preset changes
        ko.computed(function() {
            var bankToSend = currentBank() || 0,
                presetToSend = currentPreset() || 0;

            if (isReady) {
                lep.logDebug('Changed bank {} preset {}', bankToSend, presetToSend);
                noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 0, 0);
                noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 32, bankToSend);
                noteInput.sendRawMidiEvent(0xC0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, presetToSend, 0);
            } else {
                isReady = true;
            }
        });
    })();

    // Init the Pads..
    for (var padIndex = 0; padIndex < 16; padIndex++) {
        (new lep.Button({
            name: 'PadBtn' + (padIndex + 1),
            midiChannel: MIDI_CHANNEL,
            clickNote: NOTE.PAD1 + padIndex,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PadValue' + (padIndex + 1 ),
                ownValue: padIndex,
                refObservable: bankOrPresetPadIndex,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE,
                onClick: function(buttonIndex) {
                    var bankOrPresetObservable = pushEncoderTarget(),
                        currentFirstValueInMatrix = Math.floor(bankOrPresetObservable() / 16) * 16,
                        newPresetOrBank = currentFirstValueInMatrix + buttonIndex;

                    bankOrPresetObservable(newPresetOrBank);
                }
            })
        }));
    }

    // Init the numeric buttons..
    for (var numButtonIndex = 0; numButtonIndex < 8; numButtonIndex++) {
        (new lep.Button({
            name: 'NumBtn' + (numButtonIndex + 1),
            midiChannel: MIDI_CHANNEL,
            clickNote: NOTE.FIRST_NUM_BUTTON + numButtonIndex,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'NumValue' + (numButtonIndex + 1),
                ownValue: numButtonIndex,
                refObservable: bankOrPresetPageIndex,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE,
                onClick: function(buttonIndex) {
                    var isSamePage = (buttonIndex === bankOrPresetPageIndex()),
                        newValue = (buttonIndex * 16) + (isSamePage ? 0 : bankOrPresetPadIndex()),
                        bankOrPresetObservable = pushEncoderTarget();

                    // if different page was selected: switch to it but preserve the relative position of preset/bank-pad in the 4x4 matrix
                    // if the same page was clicked, switch to first first preset/bank-pad of that page

                    bankOrPresetObservable(newValue);
                }
            })
        }));
    }

    println('\n--------------\nCMD DC-1 ready');
};


// maybe for later
//SENDS_NUMBER = 0,
//WINDOW_SIZE = 4,
//trackBank = host.createTrackBank(WINDOW_SIZE, SENDS_NUMBER, 0),
//cursorDevice = host.createEditorCursorDevice(),
//isShiftPressed = ko.observable(false),
//HANDLERS = {
//    NEXT_DEVICE_OR_CHANNEL_PAGE: function() {
//        if (isShiftPressed()) {
//            cursorDevice.selectNext();
//        } else {
//            trackBank.scrollChannelsPageDown();
//        }
//    },
//    PREV_DEVICE_OR_CHANNEL_PAGE: function() {
//        if (isShiftPressed()) {
//            cursorDevice.selectPrevious();
//        } else {
//            trackBank.scrollChannelsPageUp();
//        }
//    },
//    SHIFT_CHANGE: function(note, value) {
//        isShiftPressed(!!value);
//    }
//},



function exit() {
}
