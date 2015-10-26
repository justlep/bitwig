loadAPI(1);

/**
 * Bug in Bitwig 1.3 Controller API or documentation:
 *
 * Documentation says the callback of CursorDevice.addPageNamesObserver(callback)
 * gets a "single string array parameter" .
 *
 * In fact, it gets the strings themselves as arguments.
 *
 * How to reproduce:
 *   1. Adds some devices to a track
 *   2. Switch between the devices
 *      -> warning is printed
 */

host.defineController('test', 'CursorDevice.pageNamesObserver', '1.0', '56fc5c94-7bd1-11e5-8bcf-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);

function init() {
    var cursorDevice = host.createCursorDevice();

    cursorDevice.addPageNamesObserver(function(pageNames) {
        var isPagesNamesString = (typeof pageNames === 'string'),
            actualPageNamesArray = isPagesNamesString ? arguments : pageNames;

        if (isPagesNamesString) {
            println("(!) Callback of CursorDevice.addPageNamesObserver gets strings instead of one array");
        }

        for (var i=0; i<actualPageNamesArray.length; i++) {
            println('Parameter page ' + i + ': ' + actualPageNamesArray[i]);
        }
    });
}

function exit() {}