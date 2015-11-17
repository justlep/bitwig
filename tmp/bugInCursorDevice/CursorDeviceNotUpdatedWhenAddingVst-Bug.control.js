loadAPI(1);

/**
 * Bug in Bitwig 1.3 Controller API (persists in Bitwig 1.3.1):
 *
 * Parameters observers not firing correctly if VST was dragdropped into track.
 *
 * How to reproduce:
 *   1. Add one of Bitwig's own devices (e.g. Blur) to a channel by dragging it from the right-side Browser Panel
 *      -> Parameter observers of CursorDevice are triggered with correct values -> OK
 *   2. Add a VST to a channel by dragging it from the right-side Browser Panel:
 *      -> parameter-value-related observers are triggered *once* with value 0 (no matter of actual value) -> FAIL
 *      -> even if the mapped parameter is changed, the observer won't fire -> FAIL
 *   3. Switch to a different device and then back to the VST
 *      -> param value observers are now called with correct values and will work as expected
 *
 *   This doesn't happen when the VST is added via the +-icon in the track and the resulting big browser window
 *   that reads "Select content to insert into device chain".
 */

host.defineController('meme', 'CursorDeviceNotUpdatedWhenAddingVst', '1.0', '6ac91cb4-8d22-11e5-8994-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);

function init() {
    var cursorDevice = host.createEditorCursorDevice();

    cursorDevice.addNameObserver(40, 'unknown device', function(deviceName) {
        println('Observer of CursorDevice.addNameObserver() reports: ' + deviceName);
    });

    cursorDevice.getCommonParameter(0).addValueObserver(128, function(val) {
        println('Observer of CursorDevice.getCommonParameter(0).addValueObserver() reports: ' + val);
    });

    //cursorDevice.addPageNamesObserver(function() {
    //    println('Observer of CursorDevice.addPageNamesObserver() reports:' + arguments);
    //    // Issue related to addPageNamesObserver:
    //    // https://github.com/justlep/bitwig/issues/2
    //});

    //cursorDevice.getMacro(0).getAmount().addValueObserver(128, function(val) {
    //    println('Observer of cursorDevice.getMacro(0).getAmount().addValueObserver() reports: ' + val);
    //});
}

function exit() {}