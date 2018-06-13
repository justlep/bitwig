/**
 * Simple controller doing pretty much nothing but letting all incoming midi pass through to the device,
 * allowing for free, channel-aware midi-assignment of controls.
 *
 * Source: https://github.com/justlep/bitwig/blob/master/tmp/MidiPassthru.control.js
 */

loadAPI(2);

host.defineController('Generic', 'MidiPassthru', '1.0', '657a247f-7860-4c7b-8e5b-90271ee3af6f', 'LeP');
host.defineMidiPorts(1, 0);

function init() {
    host.getMidiInPort(0).createNoteInput('Omni', '??????').setShouldConsumeEvents(false);
    println('MidiPassthru ready');
}
