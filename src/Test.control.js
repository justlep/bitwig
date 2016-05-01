loadAPI(1);
load('lep/api.js');

// @deprecationChecked:1.3.9
host.defineController('LeP', 'Test-Script', '1.0', '98eac9c6-68fb-11e5-9d70-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);

function init() {
    println('init..');

    var cursorDevice = host.createEditorCursorDevice();

    cursorDevice.addCanSelectNextObserver(function(hasNext) {
        lep.logDebug('has next device: {}', hasNext);
    });
    cursorDevice.addCanSelectPreviousObserver(function(hasPrev) {
        lep.logDebug('has prev device: {}', hasPrev);
    });
    cursorDevice.addNextParameterPageEnabledObserver(function(hasNext) {
        lep.logDebug('has next parameter page: {}', hasNext);
    });
    cursorDevice.addPreviousParameterPageEnabledObserver(function(hasPrev) {
        lep.logDebug('has prev parameter page: {}', hasPrev);
    });
    cursorDevice.addHasSelectedDeviceObserver(function(device) {
        lep.logDebug('selected device: {}', device);
    });
    cursorDevice.addNameObserver(40, 'unknown device', function(name) {
        lep.logDebug('device name: "{}"', name);
    });
    cursorDevice.addSelectedPageObserver(-1, function(paramPage) {
        lep.logDebug('param page: {}', paramPage);
        if (paramPage === 0) {
            lep.logDebug('Switching to paramPage 1');
            cursorDevice.nextParameterPage();
        }
    });
    cursorDevice.addPageNamesObserver(function(pageNames) {
        if (!pageNames) {
            lep.logDebug('No parameter pages.');
        } else {
            lep.logDebug('=> {} Parameter pages:', arguments.length);
            for (var i=0; i<arguments.length; i++) {
                lep.logDebug('** Parameter page name: {}', arguments[i]);
            }
        }
    });

    cursorDevice.addSlotsObserver(function(slots) {
        if (slots) {
            lep.logDebug('Total Device FX Slots: {}', slots.length);
            slots.forEach(function(slotName) {
                lep.logDebug('** Device FX Slot: {}', slotName);
            });
        } else {
            lep.logDebug('Device has no slots');
        }
    });

    var trackBank = host.createTrackBank(8, 8, 0);
    trackBank.addSendCountObserver(function(sends) {
       lep.logDebug('###### Sends: {}', sends);
    });


    cursorDevice.addDirectParameterIdObserver(function(ids) {
        println('directparametervalues: ' + ids.length);
        println(ids);
    });

    cursorDevice.addDirectParameterNameObserver(40, function(id, name) {
        lep.logDev('Param {} --> {}', id, name);
    });

    println('Init done.');
}

function exit() {
}