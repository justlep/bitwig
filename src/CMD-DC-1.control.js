/**
 * Bitwig Controller Script for the Behringer CMD DC-1.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);
load('lep/api.js');

// @deprecationChecked:1.3.5
host.defineController('Behringer', 'CMD DC-1 (LeP)', '1.1', '047f0d84-8ace-11e5-af63-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
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
        prefs = {
            sendBankMSB: false
        },
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        noteInput = eventDispatcher.createNoteInput('DC-1', MIDI_CHANNEL_FOR_PROGRAM_CHANGE, true),
        currentPreset = ko.observable(0).extend({notify: 'always'}),
        currentBank = (function() {
            var _bank = ko.observable(0).extend({notify: 'always'});
            return ko.computed({
                read: _bank,
                write: function(newBank) {
                    _bank(newBank);
                    currentPreset(0); // changing the bank ALWAYS resets the preset
                }
            });
        })(),
        pushEncoderTarget = ko.observable(),
        bankPageIndex = ko.computed(function() {
            return Math.floor(currentBank() / 16);
        }),
        bankPadIndex = ko.computed(function() {
            return currentBank() % 16;
        }),
        presetPageIndex = ko.computed(function() {
            return Math.floor(currentPreset() / 16);
        }),
        presetPadIndex = ko.computed(function() {
            return currentPreset() % 16;
        }),
        CONTROL_SET = {
            NUM_BUTTONS: new lep.ControlSet('NumericButtons', 8, function(numButtonIndex) {
                return new lep.Button({
                    name: 'NumBtn' + (numButtonIndex + 1),
                    midiChannel: MIDI_CHANNEL,
                    clickNote: NOTE.FIRST_NUM_BUTTON + numButtonIndex,
                });
            }),
            PADS: new lep.ControlSet('Pads', 16, function(padIndex) {
                return new lep.Button({
                    name: 'PadBtn' + (padIndex + 1),
                    midiChannel: MIDI_CHANNEL,
                    clickNote: NOTE.PAD1 + padIndex
                });
            })
        },
        VALUE_SET = {
            BANK_PAGES:  new lep.ValueSet('BankPageSet', 1, 8, function (index) {
                return new lep.KnockoutSyncedValue({
                    name: 'BankPage' + (bankPageIndex + 1),
                    ownValue: index,
                    refObservable: bankPageIndex,
                    velocityValueOn: COLOR.BLUE,
                    velocityValueOff: COLOR.ORANGE,
                    onClick: function(numButtonIndex) {
                        var newBank = (numButtonIndex * 16) + bankPadIndex();
                        currentBank(newBank);
                    }
                });
            }),
            PRESET_PAGES: new lep.ValueSet('PresetPageSet', 1, 8, function (index) {
                return new lep.KnockoutSyncedValue({
                    name: 'PresetPage' + (presetPageIndex + 1),
                    ownValue: index,
                    refObservable: presetPageIndex,
                    velocityValueOn: COLOR.BLUE,
                    velocityValueOff: COLOR.ORANGE,
                    onClick: function(numButtonIndex) {
                        var newPreset = (numButtonIndex * 16) + presetPadIndex();
                        currentPreset(newPreset);
                    }
                });
            }),
            BANKS: new lep.ValueSet('BanksValueSet', 1, 16, function(index) {
                return new lep.KnockoutSyncedValue({
                    name: 'BankVal' + (index + 1),
                    ownValue: index,
                    refObservable: bankPadIndex,
                    velocityValueOn: COLOR.BLUE,
                    velocityValueOff: COLOR.ORANGE,
                    onClick: function(padIndex) {
                        var newBank = (bankPageIndex() * 16) + padIndex;
                        currentBank(newBank);
                    }
                });
            }),
            PRESETS: new lep.ValueSet('PresetValueSet', 1, 16, function(index) {
                return new lep.KnockoutSyncedValue({
                    name: 'PresetVal' + (index + 1),
                    ownValue: index,
                    refObservable: presetPadIndex,
                    velocityValueOn: COLOR.BLUE,
                    velocityValueOff: COLOR.ORANGE,
                    onClick: function(padIndex) {
                        var newPreset = (presetPageIndex() * 16) + padIndex;
                        currentPreset(newPreset);
                    }
                });
            })
        };


    function initModeButtons() {
        // Bank Mode Button
        new lep.Button({
            name: 'BankModeButton',
            clickNote: NOTE.FIRST_TOP_BUTTON + 4,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'BankModeValue',
                ownValue: currentBank,
                refObservable: pushEncoderTarget,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE
            })
        });

        // Preset Mode Button
        new lep.Button({
            name: 'PresetModeButton',
            clickNote: NOTE.FIRST_TOP_BUTTON + 5,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PresetModeValue',
                ownValue: currentPreset,
                refObservable: pushEncoderTarget,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE
            })
        });
    }

    function initPushEncoder() {
        // 'clicking' the push encoder resets the bank and/or preset..
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

        // 'twisting' the push encoder..
        eventDispatcher.onCC(CC.PUSH_ENCODER, function(cc, value, channel){
            var targetObservable = pushEncoderTarget(),
                isBankOrPresetMode = (targetObservable === currentBank || targetObservable === currentPreset),
                diff = (value - 64);

            if (isBankOrPresetMode) {
                var newBankOrPreset = lep.util.limitToRange(targetObservable() + diff, 0, 127);
                targetObservable(newBankOrPreset);
            }
        });

        pushEncoderTarget.subscribe(function(newTarget) {
            switch(newTarget) {
                case currentBank:
                    CONTROL_SET.NUM_BUTTONS.setValueSet(VALUE_SET.BANK_PAGES);
                    CONTROL_SET.PADS.setValueSet(VALUE_SET.BANKS);
                    break;
                case currentPreset:
                    CONTROL_SET.NUM_BUTTONS.setValueSet(VALUE_SET.PRESET_PAGES);
                    CONTROL_SET.PADS.setValueSet(VALUE_SET.PRESETS);
                    break;
            }
        });

        pushEncoderTarget(currentPreset);
    }

    function initPreferences() {
        var preferences = host.getPreferences(),
            bankMsbSetting = preferences.getEnumSetting('Send MSB with ProgramChange', 'Preferences', ['YES','NO'], 'NO');

        bankMsbSetting.addValueObserver(function(useMSB) {
            prefs.sendBankMSB = (useMSB === 'YES');
            lep.logDebug('Send MSB with ProgramChange: {}', prefs.sendBankMSB);
        });
    }

    function initMidiProgramChangeSender() {
        var isFirstEvaluation = false;

        // Send MIDI ProgramChange (and bank change) messages when bank or preset changes
        ko.computed(function() {
            var bankToSend = currentBank() || 0,
                presetToSend = currentPreset() || 0;

            if (isFirstEvaluation) {
                // prevent the script from sending program change on start
                isFirstEvaluation = false;
                return;
            }

            lep.logDebug('Changed bank {} preset {}', bankToSend, presetToSend);
            if (prefs.sendBankMSB) {
                noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 0, 0);        // Bank MSB
            }
            noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 32, bankToSend);  // Bank LSB
            noteInput.sendRawMidiEvent(0xC0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, presetToSend, 0); // ProgramChange
        });
    }

    initPreferences();
    initMidiProgramChangeSender();
    initModeButtons();
    initPushEncoder();

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
