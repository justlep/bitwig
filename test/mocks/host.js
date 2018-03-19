
let host = (function() {

    let inPorts = [];

    return {
        getMidiInPort: function(inPortNumber){
            inPorts[inPortNumber] = {
                midiCallback: null,
                sysexCallback: null,
                setMidiCallback: function(fn) {
                    this.midiCallback = fn;
                },
                setSysexCallback: function(fn) {
                    this.sysexCallback = fn;
                },
                createNoteInput: function(inputName, /*...*/noteMasks){
                    return {
                        setShouldConsumeEvents: function(consume){
                        }
                    }
                }
            };

            return inPorts[inPortNumber];
        },

        mockNoteOn: function(_inPort, note, value, channel) {
            let status = 0x90 + channel,
                inPort = inPorts[_inPort];
            inPort && inPort.midiCallback.apply(this, [status, note, value]);
        },
        mockNoteOff: function(_inPort, note, value, channel) {
            let status = 0x80 + channel,
                inPort = inPorts[_inPort];
            inPort && inPort.midiCallback.apply(this, [status, note, value]);
        },
        mockCC: function(_inPort, cc, value, channel) {
            let status = 0xB0 + channel,
                inPort = inPorts[_inPort];
            inPort && inPort.midiCallback.apply(this, [status, cc, value]);
        },
        showPopupNotification: function() {
        }
    };
})();