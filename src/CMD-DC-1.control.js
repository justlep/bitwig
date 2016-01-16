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

function exit() {
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
            FIRST_NUM: 16,
            PAD1: 36
        },
        CC = {
            PUSH_ENCODER: 32,
            FIRST_ENCODER: 16
        },

        /**
         * Button color velocities. Push encoder color can not be changed.
         * Lights can't be turned off completely.
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
        pushButtonObservable = ko.observable();


    // Bank Mode Button
    (new lep.Button({
        midiChannel: MIDI_CHANNEL,
        name: 'BankModeButton',
        clickNote: NOTE.FIRST_TOP_BUTTON + 4,
        valueToAttach: new lep.KnockoutSyncedValue({
            name: 'BankModeValue',
            ownValue: currentBank,
            refObservable: pushButtonObservable,
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
            refObservable: pushButtonObservable,
            velocityValueOn: COLOR.BLUE,
            velocityValueOff: COLOR.ORANGE
        })
    }));

    // bind click events for the top push encoder..
    eventDispatcher.onNote(NOTE.PUSH_ENCODER_CLICK, function(note, value, channel) {
        var obs = pushButtonObservable(),
            isBankObserver = (obs === currentBank),
            isPresetObserver = (obs === currentPreset);

        if (isBankObserver) {
            currentBank(0);
        }
        if (isPresetObserver || isBankObserver) {
            currentPreset(0);
        }
    });

    // bind twist events for the top push encoder..
    eventDispatcher.onCC(CC.PUSH_ENCODER, function(cc, value, channel){
        var obs = pushButtonObservable(),
            diff = (value - 64);

        if (obs === currentBank || obs === currentPreset) {
            var newBankOrPreset = lep.util.limitToRange(obs() + diff, 0, 127);
            obs(newBankOrPreset);
        }
    });

    ko.computed(function() {
        lep.logDev('Changed bank {} preset {}', currentBank(), currentPreset());
        noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 0, 0);
        noteInput.sendRawMidiEvent(0xB0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, 32, currentBank());
        noteInput.sendRawMidiEvent(0xC0 + MIDI_CHANNEL_FOR_PROGRAM_CHANGE, currentPreset(), 0);
    });

    var bankOrPresetPageIndex = ko.computed(function() {
            var pushButtonObs = pushButtonObservable(),
                isBankOrPresetMode = (pushButtonObs === currentBank || pushButtonObs === currentPreset),
                pageIndex = (isBankOrPresetMode) ? Math.floor(pushButtonObs() / 16) : -1;

            return pageIndex;
        }),
        bankOrPresetModulo16 = ko.computed(function() {
            var pushButtonObs = pushButtonObservable(),
                isBankOrPresetMode = (pushButtonObs === currentBank || pushButtonObs === currentPreset),
                modValue = (isBankOrPresetMode) ? Math.floor(pushButtonObs() % 16) : -1;

                lep.logDev('modulo: ' + modValue);

            return modValue;
        });

    for (var padIndex = 0; padIndex < 16; padIndex++) {
        (new lep.Button({
            name: 'PadBtn' + (padIndex + 1),
            midiChannel: MIDI_CHANNEL,
            clickNote: NOTE.PAD1 + padIndex,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PadValue' + (padIndex + 1),
                ownValue: padIndex,
                refObservable: bankOrPresetModulo16,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE,
                onClick: function(buttonIndex) {
                    var bankOrPresetObservable = pushButtonObservable(),
                        currentFirstValueInMatrix = Math.floor(bankOrPresetObservable() / 16) * 16,
                        newPresetOrBank = currentFirstValueInMatrix + buttonIndex;

                    bankOrPresetObservable(newPresetOrBank);
                }
            })
        }));
    }

    for (var numButtonIndex = 0; numButtonIndex < 8; numButtonIndex++) {
        (new lep.Button({
            name: 'NumBtn' + (numButtonIndex + 1),
            midiChannel: MIDI_CHANNEL,
            clickNote: NOTE.FIRST_NUM + numButtonIndex,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'NumValue' + (numButtonIndex + 1),
                ownValue: numButtonIndex,
                refObservable: bankOrPresetPageIndex,
                velocityValueOn: COLOR.BLUE,
                velocityValueOff: COLOR.ORANGE,
                onClick: function(buttonIndex) {
                    var isSamePage = (buttonIndex === bankOrPresetPageIndex()),
                        newValue = (buttonIndex * 16) + (isSamePage ? 0 : bankOrPresetModulo16());

                    // if different page was selected: switch to it but preserve the relative position of preset/bank-pad in the 4x4 matrix
                    // if the same page was clicked, switch to first first preset/bank-pad of that page

                    pushButtonObservable()(newValue);
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