loadAPI(6);
load('lep/api.js');

host.defineController('LeP', 'test', '2.1', '98eac9c6-68fb-11e5-9d70-feff819cd123', 'meme');
host.defineMidiPorts(1, 1);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEBUG);

    var trackBank = host.createMainTrackBank(1, 0, 0),
        fader = new lep.Fader({
            name: 'Fader',
            valueCC: 66,
            midiChannel: 0,
            isUnidirectional: true
        }),
        vol = lep.StandardRangedValue.createVolumeValue(trackBank, 0);

    fader.attachValue(vol);

    // var cursorDevice = host.createEditorCursorDevice(0),
    //     remoteControlsPage = cursorDevice.createCursorRemoteControlsPage(8);
    //
    // remoteControlsPage.pageNames().addValueObserver(function(pageNamesArrayValue) {
    //     println('----');
    //     println('arguments.length: ' + arguments.length);
    //     println('typeof arguments: ' + typeof arguments);
    //     println('typeof arguments[0]: ' + typeof arguments[0]);
    //     println('typeof pageNamesArrayValue.length: ' + pageNamesArrayValue.length);
    //     if (pageNamesArrayValue.length > 0) {
    //         println('typeof pageNamesArrayValue[0]: ' + pageNamesArrayValue[0]);
    //     }
    //
    //     for (var i in pageNamesArrayValue) {
    //         println(i);
    //     }
    //     println('----');
    // });

    println('---');
}

function exit() {}
