/**
 * Quick prototype script to test validity of .touchOsc files
 * that were edited using QuickEdit4TouchOsc.
 *
 * See https://justlep.github.io/quickedit4touchosc/
 *
 * Requires TouchOSC Bridge running + the lep-framework in place.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(2);
load('lep-framework/complete.js');

host.defineController('LeP', 'TouchOscTest', '2.0', '4a77e824-10dd-11e7-93ae-92361f002671', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 1);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.INFO);
    var MULTI_FADER_SIZE = 8,
        MIDI_CHANNEL = 0,
        CC = {
            TAB1_FIRST_FADER: 30,
            TAB2_FIRST_FADER: 40
        },
        trackBank = host.createMainTrackBank(MULTI_FADER_SIZE, 0, 0),
        cursorDevice = host.createEditorCursorDevice(0),
        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, MULTI_FADER_SIZE),
            PARAM:  new lep.ParamsValueSet(cursorDevice)
        },
        CONTROLSET = {
            TAB1_FADERS: new lep.ControlSet('Tab1Faders', MULTI_FADER_SIZE, function(index) {
                return new lep.Fader({
                    name: 'Tab1Fader' + index,
                    valueCC: CC.TAB1_FIRST_FADER + index,
                    midiChannel: MIDI_CHANNEL
                });
            }),
            TAB2_FADERS: new lep.ControlSet('Tab2Faders', MULTI_FADER_SIZE, function(index) {
                return new lep.Fader({
                    name: 'Tab2Fader' + index,
                    valueCC: CC.TAB2_FIRST_FADER + index,
                    midiChannel: MIDI_CHANNEL
                });
            })
        };

    CONTROLSET.TAB1_FADERS.setValueSet(VALUESET.VOLUME);
    CONTROLSET.TAB2_FADERS.setValueSet(VALUESET.PARAM);

    println('go');
}

function exit() {}
