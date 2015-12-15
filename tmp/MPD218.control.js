loadAPI(1);

// @deprecationChecked:1.3.5
host.defineController('Akai', 'MPD218 (Aftertouch)', '1.0.0', '22f11cd0-a310-11e5-bf7f-feff819cdc9f', 'LeP');
host.defineMidiPorts(1, 1);

var DEVICE_NAME =  host.platformIsMac() ? 'MPD218 Port A' : 'MPD218';
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

function init() {
    var midiIn = host.getMidiInPort(0),
        padNotes = midiIn.createNoteInput('MPD218 Pads', '89????', '99????', 'D?????', 'EF????', 'AF????'),
        cursorDevice = host.createEditorCursorDevice(),
        channelAftertouchAsUserControl = host.createUserControls(1).getControl(0);

    channelAftertouchAsUserControl.setLabel('Aftertouch');

    padNotes.setShouldConsumeEvents(false);

    midiIn.setMidiCallback(function(status, data1, data2) {
        if (status === 0xb1) {
            cursorDevice.getMacro(data1).getAmount().inc(uint7ToInt7(data2), 128);
        } else if (status === 0xb2) {
            cursorDevice.getParameter(data1).inc(uint7ToInt7(data2), 128);
        } else if ((status & 0xF0) === 0xD0) {
            channelAftertouchAsUserControl.set(data1, 128);
        }
    });

    println('MPD218 ready');
}

