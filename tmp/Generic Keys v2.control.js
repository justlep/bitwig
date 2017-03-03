/**
 * A Bitwig2-compatible version of TomsGenericKeys
 * (original at https://github.com/ThomasHelzle/Toms_Bitwig_Scripts/blob/master/TomsGeneric/TomsGenericKeyboard.control.js)
 *
 * Enhanced Generic Controller Script with Support for
 *  - all 16 Midi Channels + Omni
 *  - CCs 1-119 fully mappable...
 *
 *  (!) Bug?: Omni is currently not working - channel-specific note inputs seem to 'mask' the Omni.
 *            Vice-versa, if Omni is defined *before* channel-specific inputs, the channel-input are silenced.
 */

loadAPI(2);

host.defineController('Generic', 'Generic Keys v2', '2.0', '4dc7bf18-004d-11e7-93ae-92361f002671', 'justlep');
host.defineMidiPorts(1, 1);

var LOWEST_CC = 1,
    HIGHEST_CC = 119,
    NUMBER_OF_CCS = HIGHEST_CC - LOWEST_CC + 1,
    userControls;

function init() {
    var midiInPort = host.getMidiInPort(0);

    // define note inputs Ch1 to Ch16..
    for (var i = 0, inputName, mask, noteInput; i < 16; i++) {
        inputName = 'Ch' + (i+1);
        mask = '?x????'.replace('x', i.toString(16));
        noteInput = midiInPort.createNoteInput(inputName, mask);
        noteInput.setShouldConsumeEvents(false);
    }
    // define 'Omni' note input
    midiInPort.createNoteInput('Omni', '??????').setShouldConsumeEvents(false);

    // define freely mappable userControls..
    userControls = host.createUserControls(NUMBER_OF_CCS);
    for (var i = 0; i < NUMBER_OF_CCS; i++) {
        userControls.getControl(i).setLabel('CC' + (LOWEST_CC + i));
    }

    // make incoming CC messages change the userControls' values
    midiInPort.setMidiCallback(function(status, data1, data2) {
        if (isChannelController(status) && data1 >= LOWEST_CC && data1 <= HIGHEST_CC) {
            var index = data1 - LOWEST_CC;
            userControls.getControl(index).value().set(data2, 128);
        }
    });

    println('Generic Keys v2 ready');
}

function exit() {}
