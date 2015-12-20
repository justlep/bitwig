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

/**
 * (just for documentation)
 * The array of 128 volume display values as generated in Bitwig 1.3.5
 * @type {string[]}
 */
const VOLUME_DISPLAY_VALUES = [
    "-Inf dB",
    "-120.2 dB",
    "-102.1 dB",
    "-91.6 dB",
    "-84.1 dB",
    "-78.3 dB",
    "-73.5 dB",
    "-69.5 dB",
    "-66.0 dB",
    "-63.0 dB",
    "-60.2 dB",
    "-57.7 dB",
    "-55.5 dB",
    "-53.4 dB",
    "-51.4 dB",
    "-49.6 dB",
    "-48.0 dB",
    "-46.4 dB",
    "-44.9 dB",
    "-43.5 dB",
    "-42.1 dB",
    "-40.9 dB",
    "-39.7 dB",
    "-38.5 dB",
    "-37.4 dB",
    "-36.3 dB",
    "-35.3 dB",
    "-34.3 dB",
    "-33.4 dB",
    "-32.5 dB",
    "-31.6 dB",
    "-30.7 dB",
    "-29.9 dB",
    "-29.1 dB",
    "-28.3 dB",
    "-27.6 dB",
    "-26.8 dB",
    "-26.1 dB",
    "-25.4 dB",
    "-24.7 dB",
    "-24.1 dB",
    "-23.4 dB",
    "-22.8 dB",
    "-22.2 dB",
    "-21.6 dB",
    "-21.0 dB",
    "-20.4 dB",
    "-19.9 dB",
    "-19.3 dB",
    "-18.8 dB",
    "-18.3 dB",
    "-17.8 dB",
    "-17.2 dB",
    "-16.8 dB",
    "-16.3 dB",
    "-15.8 dB",
    "-15.3 dB",
    "-14.9 dB",
    "-14.4 dB",
    "-14.0 dB",
    "-13.5 dB",
    "-13.1 dB",
    "-12.7 dB",
    "-12.2 dB",
    "-11.8 dB",
    "-11.4 dB",
    "-11.0 dB",
    "-10.6 dB",
    "-10.3 dB",
    "-9.88 dB",
    "-9.50 dB",
    "-9.13 dB",
    "-8.77 dB",
    "-8.41 dB",
    "-8.05 dB",
    "-7.70 dB",
    "-7.36 dB",
    "-7.02 dB",
    "-6.68 dB",
    "-6.35 dB",
    "-6.02 dB",
    "-5.70 dB",
    "-5.38 dB",
    "-5.06 dB",
    "-4.75 dB",
    "-4.44 dB",
    "-4.14 dB",
    "-3.84 dB",
    "-3.54 dB",
    "-3.24 dB",
    "-2.95 dB",
    "-2.67 dB",
    "-2.38 dB",
    "-2.10 dB",
    "-1.82 dB",
    "-1.54 dB",
    "-1.27 dB",
    "-1.00 dB",
    "-0.73 dB",
    "-0.47 dB",
    "-0.21 dB",
    "+0.05 dB",
    "+0.31 dB",
    "+0.56 dB",
    "+0.81 dB",
    "+1.06 dB",
    "+1.31 dB",
    "+1.56 dB",
    "+1.80 dB",
    "+2.04 dB",
    "+2.28 dB",
    "+2.51 dB",
    "+2.75 dB",
    "+2.98 dB",
    "+3.21 dB",
    "+3.43 dB",
    "+3.66 dB",
    "+3.88 dB",
    "+4.11 dB",
    "+4.33 dB",
    "+4.54 dB",
    "+4.76 dB",
    "+4.97 dB",
    "+5.19 dB",
    "+5.40 dB",
    "+5.61 dB",
    "+5.81 dB",
    "+6.02 dB"
];