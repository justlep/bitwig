loadAPI(1);
load('json2.js');

// @deprecationChecked:1.3.5
host.defineController('Test', 'VolumeDisplayValues', '1.0', 'e3e424f2-a764-11e5-bf7f-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);


function init() {
    var trackBank = host.createTrackBank(1, 0, 0),
        channelVolume = trackBank.getChannel(0).getVolume(),
        lastVolValue,
        volumes = {},
        volumeDisplayValuesArray = [],
        valuesLeft = 128;

        channelVolume.addValueObserver(128, function(newVol) {
            lastVolValue = newVol;
        });

        channelVolume.addValueDisplayObserver(30, '??', function(valAsString) {
            if (lastVolValue === undefined) return;

            if (!volumes[lastVolValue]) {
                volumes[lastVolValue] = valAsString;
                volumeDisplayValuesArray[lastVolValue] = valAsString;
                valuesLeft--;
                println('values left: ' + valuesLeft);
            }
            if (!valuesLeft) {
                println('const VOLUME_DISPLAY_VALUES = ' + JSON.stringify(volumeDisplayValuesArray, null, 2));
            }
        });
}

function exit(){}