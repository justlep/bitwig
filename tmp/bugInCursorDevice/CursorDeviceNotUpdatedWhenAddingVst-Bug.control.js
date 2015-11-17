loadAPI(1);

/**
 * Bug in Bitwig 1.3 Controller API (persists in Bitwig 1.3.1):
 *
 * How to reproduce:
 *   1. Add one of Bitwig's own devices to a channel (e.g. Blur)
 *      -> observers of CursorDevice are triggered -> OK
 *   2. Add a VST to a channel
 *      -> NO observers of CursorDevice are triggered -> FAIL
 *      -> switch to another device and then back to the VST -> observers are called -> OK
 */

host.defineController('meme', 'CursorDeviceNotUpdatedWhenAddingVst', '1.0', '6ac91cb4-8d22-11e5-8994-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);

function init() {
    var cursorDevice = host.createEditorCursorDevice();

    cursorDevice.addNameObserver(40, 'unknown device', function(deviceName) {
        println('Observer of CursorDevice.addNameObserver(..) reports: ' + deviceName);
    });

    cursorDevice.addPageNamesObserver(function() {
        println('Observer of CursorDevice.addPageNamesObserver(..) reports:' + arguments);
        // Other issue with addPageNamesObserver:
        // https://github.com/justlep/bitwig/issues/2
    });

    cursorDevice.getCommonParameter(0).addValueObserver(128, function(val) {
        println('Observer of CursorDevice.getCommonParameter(0).addValueObserver(..) reports: ' + val);
    });
}

function exit() {}