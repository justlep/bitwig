/**
 * Simple controller doing pretty much nothing but letting all incoming midi pass through to the device,
 * allowing for free, channel-aware midi-assignment of controls.
 *
 * Source: https://github.com/justlep/bitwig/blob/master/tmp/MidiPassthruMulti.control.js
 */

loadAPI(2);

host.defineController('Generic', 'MidiPassthruMulti', '1.0', '3ed96c1c-6f29-11e8-adc0-fa7ae01bbebc', 'LeP');
host.defineMidiPorts(1, 0);

function init() {
    var inPort = host.getMidiInPort(0);

    inPort.createNoteInput('Omni', '??????').setShouldConsumeEvents(false);

    for (var channel = 0, inputName; channel <= 15; channel++) {
        inputName = 'Ch ' + (channel+1);
        inPort.createNoteInput(inputName, '?'+channel+'????').setShouldConsumeEvents(false);
    }

    println('MidiPassthruMulti ready');
}
