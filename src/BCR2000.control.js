/**
 * Bitwig Controller Script for the Behringer BCR2000.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);
load('lep/api.js');

// @deprecationChecked:1.3.9
host.defineController('Behringer', 'BCR2000 (LeP)', '1.1', 'fe5a1578-0fbd-11e6-a148-3e1d05defe78', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['BCR2000'], ['BCR2000']);
host.addDeviceNameBasedDiscoveryPair(['BCR2000 port 1'], ['BCR2000 port 1']);
host.addDeviceNameBasedDiscoveryPair(['BCR2000 Port 1'], ['BCR2000 Port 1']);

// host.addDeviceNameBasedDiscoveryPair(['BCR2000 port 2'], ['BCR2000 port 2']);
// host.addDeviceNameBasedDiscoveryPair(['BCR2000 Port 2'], ['BCR2000 Port 2']);
// host.addDeviceNameBasedDiscoveryPair(['BCR2000 port 3'], ['BCR2000 port 3']);
// host.addDeviceNameBasedDiscoveryPair(['BCR2000 Port 3'], ['BCR2000 Port 3']);

/**
 * Switches the BCR2000 into a given preset number.
 * @param presetNumber (Number) 1-based (!)
 */
function switchBcrToPreset(presetNumber) {
    var digit1 = '' + Math.floor(presetNumber/10),
        digit2 = '' + presetNumber % 10,
        sysexLines = [
            'F0 00 20 32 7F 7F 20 00 00 24 72 65 76 20 52 31 F7',
            'F0 00 20 32 7F 7F 20 00 01 F7',
            'F0 00 20 32 7F 7F 20 00 02 24 72 65 63 61 6C 6C 20 3X 3Y F7'.replace('X', digit1).replace('Y', digit2),
            'F0 00 20 32 7F 7F 20 00 03 F7',
            'F0 00 20 32 7F 7F 20 00 04 24 65 6E 64 F7'
        ];

    println('Switching BCR2000 to preset ' + presetNumber);

    // sending the switch command line by line (single line by join(' ') didn't work for whatever reason)
    sysexLines.forEach(sendSysex);
}

function init() {
    lep.setLogLevel(lep.LOGLEVEL.INFO);
    //new lep.BCR2000(28, 12);
    new lep.BCR2000(29, 13);
}

function exit() {
    switchBcrToPreset(1);
}

/**
 * @constructor
 * @param bcrPresetNumber (Number) 1-based BCR2000 preset
 * @param bcfMidiChannel (Number) 0-based BCR2000 MIDI channel
 */
lep.BCR2000 = function(bcrPresetNumber, bcfMidiChannel) {

    lep.util.assertNumberInRange(bcrPresetNumber, 1, 32, 'Invalid bcrPresetNumber for BCR2000');
    lep.util.assertNumberInRange(bcfMidiChannel, 0, 15, 'Invalid bcfMidiChannel for BCR2000');

    switchBcrToPreset(bcrPresetNumber);

    host.getNotificationSettings().getUserNotificationsEnabled().set(true);

    var WINDOW_SIZE = 8,
        SENDS_NUMBER = 6,
        PARAM_PAGES_NUMBER = 6,
        USER_CONTROL_PAGES = 6,
        MAX_MORPHABLE_PARAMS_NUMBER = (WINDOW_SIZE * Math.max(SENDS_NUMBER, PARAM_PAGES_NUMBER, USER_CONTROL_PAGES)),
        prefs = {
            soloExclusive: true
        },
        CC = {
            FIRST_ENCODER: 8,
            FIRST_FADER: 81,
            ENCODER_ROWS_FIRST_ENCODER: [81, 89, 97] // from top to bottom
        },
        NOTE = {
            A1: 65,
            B1: 73,
            FIRST_ENCODER_CLICK: 33,
            EG1: 57, EG2: 58, EG3: 59, EG4: 60,
            F1: 53, F2: 54, F3: 55, F4: 56,
            T1: 49, T2: 50, T3: 51, T4: 52,
            P1: 63, P2: 64
        },
        NOTE_ACTION = {
            MODE_SOLO_MUTE: NOTE.EG1,
            MODE_VALUE_PAGE_SELECT: NOTE.EG2,
            MODE_ARM_SELECT: NOTE.EG3,
            MODE_VALUE_SELECT: NOTE.EG4,
            SHIFT: NOTE.F1,
            MORPHER: NOTE.F2,
            RECORD: NOTE.F3,
            LOOP: NOTE.F4,
            PREV_DEVICE_OR_CHANNEL_PAGE: NOTE.P1,
            NEXT_DEVICE_OR_CHANNEL_PAGE: NOTE.P2,
            PUNCH_IN: NOTE.T1,
            PUNCH_OUT: NOTE.T2,
            STOP_MUTEFADERS: NOTE.T3,
            PLAY: NOTE.T4
        },

        transport = lep.util.getTransport(),
        trackBank = host.createTrackBank(WINDOW_SIZE, SENDS_NUMBER, 0),
        cursorDevice = host.createEditorCursorDevice(),
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),

        isShiftPressed = ko.observable(false),
        clearPunchOnStop = ko.observable(true),

        morpher = lep.Morpher.getInstance(WINDOW_SIZE, MAX_MORPHABLE_PARAMS_NUMBER, isShiftPressed),

        HANDLERS = {
            NEXT_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectNext();
                } else {
                    trackBank.scrollChannelsPageDown();
                }
            },
            PREV_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectPrevious();
                } else {
                    trackBank.scrollChannelsPageUp();
                }
            },
            SHIFT_CHANGE: function(note, value) {
                isShiftPressed(!!value);
            },
            PLAYING_STATUS_CHANGED: function(isPlaying) {
                if (!isPlaying && clearPunchOnStop()) {
                    if (TRANSPORT_VALUE.PUNCH_IN.value) {
                        transport.togglePunchIn();
                    }
                    if (TRANSPORT_VALUE.PUNCH_OUT.value) {
                        transport.togglePunchOut();
                    }
                }
            }
        },

        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, WINDOW_SIZE),
            PAN:    lep.ValueSet.createPanValueSet(trackBank, WINDOW_SIZE),
            SEND:   lep.ValueSet.createSendsValueSet(trackBank, SENDS_NUMBER, WINDOW_SIZE),
            MACRO:  new lep.MacroValueSet(cursorDevice),
            PARAM:  new lep.ParamsValueSet(cursorDevice),
            USERCONTROL: lep.ValueSet.createUserControlsValueSet(USER_CONTROL_PAGES, WINDOW_SIZE, 'BCF-UC-{}-{}'),
            SOLO:   lep.ValueSet.createSoloValueSet(trackBank, WINDOW_SIZE, prefs),
            ARM:    lep.ValueSet.createArmValueSet(trackBank, WINDOW_SIZE),
            MUTE:   lep.ValueSet.createMuteValueSet(trackBank, WINDOW_SIZE),
            SELECT: lep.ValueSet.createSelectValueSet(trackBank, WINDOW_SIZE)
        },

        SWITCHABLE_VALUESETS = [
            VALUESET.VOLUME,
            VALUESET.PAN,
            VALUESET.SEND,
            VALUESET.MACRO,
            VALUESET.PARAM,
            VALUESET.USERCONTROL
        ],

        getNextFreeSwitchableValueSet = function() {
            for (var i = 0, valueSet; i < SWITCHABLE_VALUESETS.length; i++) {
                valueSet = SWITCHABLE_VALUESETS[i];
                if (!valueSet.isControlled()) {
                    return valueSet;
                }
            }
            return null;
        },

        /**
         * Observable holding the VALUE_SET.* that is currently assigned to the encoders.
         * When setting a valueSet that is already used by the faders, the valueSets of faders/encoders will be swapped.
         */
        currentEncoderValueSetObservable = (function(){
            var _valueSet = ko.observable();
            return ko.computed({
                read: _valueSet,
                write: function(newValueSet) {
                    lep.util.assertValueSet(newValueSet, 'Invalid valueSet for currentEncoderValueSetObservable');
                    var oldValueSet = _valueSet(),
                        otherObservable = currentFaderValueSetObservable;
                    _valueSet(newValueSet);
                    CONTROLSET.ENCODERS.setValueSet(newValueSet);
                    if (newValueSet === otherObservable()) {
                        otherObservable(oldValueSet);
                    }
                }
            });
        })(),
        /**
         * Observable holding the VALUE_SET.* that is currently assigned to the faders.
         * When setting a valueSet that is already used by the encoders, the valueSets of faders/encoders will be swapped.
         */
        currentFaderValueSetObservable = (function(){
            var _valueSet = ko.observable();
            return ko.computed({
                read: _valueSet,
                write: function(newValueSet) {
                    lep.util.assertValueSet(newValueSet, 'Invalid valueSet for currentFaderValueSetObservable');
                    if (morpher.isActive()) {
                        lep.logDebug('(!) Forcing currentFaderValueSetObservable to value=null since morpher is active.');
                        _valueSet(null);
                        return;
                    }
                    var oldValueSet = _valueSet(),
                        otherObservable = currentEncoderValueSetObservable;
                    _valueSet(newValueSet);
                    CONTROLSET.FADERS.setValueSet(newValueSet);
                    if (newValueSet === otherObservable()) {
                        otherObservable(oldValueSet);
                    }
                }
            });
        })(),

        initEncodersAndFadersValueSet = function() {
            currentEncoderValueSetObservable(VALUESET.PAN);
            currentFaderValueSetObservable(VALUESET.VOLUME);
        },

        CONTROLSET = {
            ENCODERS: new lep.ControlSet('ClickEncoders', WINDOW_SIZE, function(index) {
                return new lep.ClickEncoder({
                    name: 'ClickEncoder' + index,
                    valueCC: CC.FIRST_ENCODER + index,
                    clickNote: NOTE.FIRST_ENCODER_CLICK + index,
                    midiChannel: bcfMidiChannel
                });
            }),
            FADERS: new lep.ControlSet('Faders', 8 * 3, function(index) {
                return new lep.Encoder({
                    name: 'Fader' + index,
                    valueCC: CC.FIRST_FADER + index,
                    midiChannel: bcfMidiChannel
                });
            }),
            UPPER_BUTTONS: new lep.ControlSet('Upper Buttons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'UpperBtn' + index,
                    clickNote: NOTE.A1 + index,
                    midiChannel: bcfMidiChannel
                });
            }),
            LOWER_BUTTONS: new lep.ControlSet('Lower Buttons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'LowerBtn' + index,
                    clickNote: NOTE.B1 + index,
                    midiChannel: bcfMidiChannel
                });
            })
        },

        /**
         * ValueSets for the buttons selecting which value type (volume, pan etc) is assigned to the encoders/faders.
         * (!) The last two buttons do NOT repesent value *type* but the -/+ buttons for the active value *PAGE*
         */
        VALUETYPE_BTN_VALUESET = {
            _assertion: lep.util.assert(SWITCHABLE_VALUESETS.length <= WINDOW_SIZE-2, 'There are more value types than encoder buttons!'),
            FOR_ENCODERS: new lep.ValueSet('EncoderValueTypeSelect', 1, WINDOW_SIZE, function(index) {
                var isPrevPageIndex = (index === WINDOW_SIZE-2),
                    isNextPageBtn = (index === WINDOW_SIZE-1);

                if (isPrevPageIndex) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderPrevValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.ENCODERS.hasPrevValuePage,
                        onClick: CONTROLSET.ENCODERS.prevValuePage
                    });
                }
                if (isNextPageBtn) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderNextValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.ENCODERS.hasNextValuePage,
                        onClick: CONTROLSET.ENCODERS.nextValuePage
                    });
                }
                if (SWITCHABLE_VALUESETS[index]) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderValueTypeSelect-' + SWITCHABLE_VALUESETS[index].name,
                        ownValue: SWITCHABLE_VALUESETS[index],
                        refObservable: currentEncoderValueSetObservable
                    });
                }
            }),
            FOR_FADERS: new lep.ValueSet('FaderValueTypeSelect', 1, WINDOW_SIZE, function(index) {
                lep.util.assert(SWITCHABLE_VALUESETS.length);
                var isPrevPageIndex = (index === WINDOW_SIZE-2),
                    isNextPageBtn = (index === WINDOW_SIZE-1);

                if (isPrevPageIndex) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderPrevValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.FADERS.hasPrevValuePage,
                        onClick: CONTROLSET.FADERS.prevValuePage
                    });
                }
                if (isNextPageBtn) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderNextValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.FADERS.hasNextValuePage,
                        onClick: CONTROLSET.FADERS.nextValuePage
                    });
                }
                if (SWITCHABLE_VALUESETS[index]) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderValueTypeSelect-' + SWITCHABLE_VALUESETS[index].name,
                        ownValue: SWITCHABLE_VALUESETS[index],
                        refObservable: currentFaderValueSetObservable
                    });
                }
            })
        },

        /**
         * ValueSets for the buttons selecting which value PAGE is active in the currently
         * attached valueSet of to the encoders/faders.
         */
        VALUEPAGE_BTN_VALUESET = {
            FOR_ENCODERS: new lep.ValueSet('EncoderValuePageSelect', 1, WINDOW_SIZE, function(index) {
                if (index >= WINDOW_SIZE-2) {
                    var prevOrNextValuePageBtnValue = VALUETYPE_BTN_VALUESET.FOR_ENCODERS.values[index];
                    lep.util.assert(prevOrNextValuePageBtnValue && prevOrNextValuePageBtnValue instanceof lep.KnockoutSyncedValue,
                                    'Unexpected type for VALUETYPE_BTN_VALUESET.FOR_ENCODERS.values[{}]', index);
                    return prevOrNextValuePageBtnValue;
                }
                return new lep.KnockoutSyncedValue({
                    name: 'EncoderValuePageSelect-' + index,
                    ownValue: index,
                    refObservable: CONTROLSET.ENCODERS.valuePage
                });
            }),
            FOR_FADERS: new lep.ValueSet('FaderValuePageSelect', 1, WINDOW_SIZE, function(index) {
                if (index >= WINDOW_SIZE-2) {
                    var prevOrNextValuePageBtnValue = VALUETYPE_BTN_VALUESET.FOR_FADERS.values[index];
                    lep.util.assert(prevOrNextValuePageBtnValue && prevOrNextValuePageBtnValue instanceof lep.KnockoutSyncedValue,
                                    'Unexpected type for VALUETYPE_BTN_VALUESET.FOR_FADERS.values[{}]', index);
                    return prevOrNextValuePageBtnValue;
                }
                return new lep.KnockoutSyncedValue({
                    name: 'FaderValuePageSelect-' + index,
                    ownValue: index,
                    refObservable: CONTROLSET.FADERS.valuePage
                });
            })
        },

        /**
         * Create the button and attachend value that toggle the Morpher on/off
         */
        initMorpherButton = function() {
            new lep.Button({
                name: 'MorpherToggleBtn',
                midiChannel: bcfMidiChannel,
                clickNote: NOTE_ACTION.MORPHER,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'MorpherToggle',
                    ownValue: true,
                    refObservable: morpher.isActive,
                    onClick: function() {
                        if (morpher.isActive()) {
                            if (isShiftPressed()) {
                                morpher.clearAllSnapshots();
                                return;
                            }
                            morpher.deactivate(function(previousValueSet) {
                                var isPreviousValueSetRestorable = (previousValueSet && !previousValueSet.isControlled());

                                if (isPreviousValueSetRestorable) {
                                    currentFaderValueSetObservable(previousValueSet);
                                } else {
                                    // e.g. if volume was assigned to the faders before morpher took control over them,
                                    // and then volume is assigned to the upper encoders, then on deactivating morpher,
                                    // don't "steal back" the volume valueSet from the encoders
                                    // but assign the next best *free* unused valueSet to the faders
                                    currentFaderValueSetObservable( getNextFreeSwitchableValueSet() );
                                }
                            });
                        }  else {
                            morpher.activate(CONTROLSET.FADERS, CONTROLSET.ENCODERS.valueSet);
                            currentFaderValueSetObservable(CONTROLSET.FADERS.valueSet());
                        }
                        // update button rows by re-triggering the currentEncoderGroupMode's write()
                        currentEncoderGroupMode(currentEncoderGroupMode());
                    }
                })
            });
        },

        currentEncoderGroupMode = (function(){
            var _currentEncoderGroupMode = ko.observable();
            return ko.computed({
                read: _currentEncoderGroupMode,
                write: function(newGroupModeKey) {
                    lep.util.assertObject(ENCODER_GROUPS[newGroupModeKey], 'Unknown encoder groupModeKey: {}', newGroupModeKey);
                    lep.logDebug('Switching encoderGroupMode to "{}"', newGroupModeKey);
                    _currentEncoderGroupMode(newGroupModeKey);

                    var buttonValueSets = ENCODER_GROUPS[newGroupModeKey].BUTTON_VALUESETS,
                        lowerButtonValueSet = buttonValueSets.lower,
                        enforceMorpherSnapshotSelects = morpher.isActive() && lowerButtonValueSet &&
                                                        lowerButtonValueSet !== VALUESET.MUTE &&
                                                        lowerButtonValueSet !== VALUESET.SELECT;

                    if (enforceMorpherSnapshotSelects) {
                        // While the morpher is active, the lower button row is reserved for
                        // mute (in SOLO/MUTE mode), select (in ARM/SELECT mode)
                        // or the Morpher's own snapshotSelect values in ALL other EG modes.
                        lep.logDebug('Reserved {} for Morpher Snapshot-selects', CONTROLSET.LOWER_BUTTONS.name);
                        lowerButtonValueSet = morpher.getSnapshotSelectValueSet();
                    }

                    if (buttonValueSets.upper) {
                        CONTROLSET.UPPER_BUTTONS.setValueSet(buttonValueSets.upper);
                    }
                    if (lowerButtonValueSet) {
                        CONTROLSET.LOWER_BUTTONS.setValueSet(lowerButtonValueSet);
                    }
                }
            });
        })(),

        createGroupModeBtnValue = function(modeKey, valueName) {
            return new lep.KnockoutSyncedValue({
                name: valueName,
                ownValue: modeKey,
                refObservable: currentEncoderGroupMode,
                restoreRefAfterLongClick: true
            });
        },
        ENCODER_GROUPS = {
            SOLO_MUTE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('SOLO_MUTE', 'Mode Solo/Mute'),
                BUTTON_VALUESETS: {upper: VALUESET.SOLO, lower: VALUESET.MUTE}
            },
            ARM_SELECT: {
                MODE_BTN_VALUE: createGroupModeBtnValue('ARM_SELECT', 'Mode Arm/Select'),
                BUTTON_VALUESETS: {upper: VALUESET.ARM, lower: VALUESET.SELECT}
            },
            VALUE_TYPE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('VALUE_TYPE', 'Mode ValueType'),
                BUTTON_VALUESETS: {upper: VALUETYPE_BTN_VALUESET.FOR_ENCODERS, lower: VALUETYPE_BTN_VALUESET.FOR_FADERS}
            },
            VALUE_PAGE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('VALUE_PAGE', 'Mode ValuePage'),
                BUTTON_VALUESETS: {upper: VALUEPAGE_BTN_VALUESET.FOR_ENCODERS, lower: VALUEPAGE_BTN_VALUESET.FOR_FADERS}
            }
        },

        initEncoderModeButtons = function() {
            new lep.Button({
                name: 'Mode Solo/Mute Btn',
                clickNote: NOTE_ACTION.MODE_SOLO_MUTE,
                midiChannel: bcfMidiChannel,
                valueToAttach: ENCODER_GROUPS.SOLO_MUTE.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode Arm/Select Btn',
                clickNote: NOTE_ACTION.MODE_ARM_SELECT,
                midiChannel: bcfMidiChannel,
                valueToAttach: ENCODER_GROUPS.ARM_SELECT.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode ValueType Btn',
                clickNote: NOTE_ACTION.MODE_VALUE_SELECT,
                midiChannel: bcfMidiChannel,
                valueToAttach: ENCODER_GROUPS.VALUE_TYPE.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode ValuePage Btn',
                clickNote: NOTE_ACTION.MODE_VALUE_PAGE_SELECT,
                midiChannel: bcfMidiChannel,
                valueToAttach: ENCODER_GROUPS.VALUE_PAGE.MODE_BTN_VALUE
            });
            currentEncoderGroupMode('VALUE_TYPE');
        },

        initPreferences = function() {
            var preferences = host.getPreferences();
            var soloExclusiveValue = preferences.getEnumSetting('SOLO Exlusive', 'Preferences', ['ON','OFF'], 'OFF');
            soloExclusiveValue.addValueObserver(function(newValue) {
                prefs.soloExclusive = (newValue === 'ON');
                lep.logDebug('Toggled SOLO EXCLUSIVE {}', prefs.soloExclusive);
            });
        },
        TRANSPORT_VALUE = {
            PLAY: lep.ToggledTransportValue.create('Play'),
            RECORD: lep.ToggledTransportValue.create('Record'),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.create('ArrangerAutomation'),
            LOOP: lep.ToggledTransportValue.create('Loop'),
            METRONOME: lep.ToggledTransportValue.create('Metronome'),
            OVERDUB: lep.ToggledTransportValue.create('Overdub'),
            PUNCH_IN: lep.ToggledTransportValue.create('PunchIn'),
            PUNCH_OUT: lep.ToggledTransportValue.create('PunchOut'),
            CLEAR_PUNCH_ON_STOP: new lep.KnockoutSyncedValue({
                name: 'ClearPunchInOutOnStop',
                ownValue: true,
                refObservable: clearPunchOnStop,
                onClick: function() {
                    clearPunchOnStop(!clearPunchOnStop());
                }
            })
        },
        initTransportButtons = function() {
            new lep.Button({
                name: 'PlayBtn',
                clickNote: NOTE_ACTION.PLAY,
                midiChannel: bcfMidiChannel,
                valueToAttach: TRANSPORT_VALUE.PLAY
            });
            new lep.Button({
                name: 'RecordBtn',
                clickNote: NOTE_ACTION.RECORD,
                midiChannel: bcfMidiChannel,
                valueToAttach: ko.computed(function() {
                    return isShiftPressed() ? TRANSPORT_VALUE.ARRANGER_AUTOMATION : TRANSPORT_VALUE.RECORD;
                })
            });
            new lep.Button({
                name: 'PunchInBtn',
                clickNote: NOTE_ACTION.PUNCH_IN,
                midiChannel: bcfMidiChannel,
                valueToAttach: ko.computed(function() {
                    return isShiftPressed() ? TRANSPORT_VALUE.OVERDUB : TRANSPORT_VALUE.PUNCH_IN;
                })
            });
            new lep.Button({
                name: 'PunchOutBtn',
                clickNote: NOTE_ACTION.PUNCH_OUT,
                midiChannel: bcfMidiChannel,
                valueToAttach: ko.computed(function() {
                    return isShiftPressed() ? TRANSPORT_VALUE.CLEAR_PUNCH_ON_STOP : TRANSPORT_VALUE.PUNCH_OUT;
                })
            });
            new lep.Button({
                name: 'LoopBtn',
                clickNote: NOTE_ACTION.LOOP,
                midiChannel: bcfMidiChannel,
                valueToAttach: ko.computed(function() {
                    return isShiftPressed() ? TRANSPORT_VALUE.METRONOME : TRANSPORT_VALUE.LOOP;
                })
            });
            new lep.Button({
                name: 'StopBtn',
                clickNote: NOTE_ACTION.STOP_MUTEFADERS,
                midiChannel: bcfMidiChannel,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'Stop/MuteFaders',
                    ownValue: true,
                    refObservable: ko.computed(function(){
                        return isShiftPressed() && !CONTROLSET.FADERS.muted();
                    }),
                    onClick: function() {
                        if (isShiftPressed()) {
                            CONTROLSET.FADERS.toggleMuted();
                        } else {
                            transport.stop();
                        }
                    }
                })
            });

            transport.addIsPlayingObserver(HANDLERS.PLAYING_STATUS_CHANGED);
        };

    eventDispatcher.onNotePressed(NOTE_ACTION.NEXT_DEVICE_OR_CHANNEL_PAGE, HANDLERS.NEXT_DEVICE_OR_CHANNEL_PAGE);
    eventDispatcher.onNotePressed(NOTE_ACTION.PREV_DEVICE_OR_CHANNEL_PAGE, HANDLERS.PREV_DEVICE_OR_CHANNEL_PAGE);
    eventDispatcher.onNote(NOTE_ACTION.SHIFT, HANDLERS.SHIFT_CHANGE);

    initPreferences();
    initTransportButtons();
    initEncodersAndFadersValueSet();
    initEncoderModeButtons();
    initMorpherButton();

    println('\n-------------\nBCR2000 ready');
};
