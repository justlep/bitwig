loadAPI(2);
load('MultiRcPages.js');

host.defineController('LeP', 'MultiRcPagesTest', '0.1', '1500a05c-0e51-11e7-93ae-92361f002671', 'github@justlep.net');
host.defineMidiPorts(1, 0);

function init() {
    var SIMULTANEOUSLY_MAPPED_RC_PAGES = 2,
        CONTROLS_PER_PAGE = 8,
        CC = {
            PAGE_DOWN: 36,
            PAGE_UP: 37,
            FIRST_CONTROL: 16,
            get LAST_CONTROL() {
                return this.FIRST_CONTROL + (CONTROLS_PER_PAGE * SIMULTANEOUSLY_MAPPED_RC_PAGES) - 1;
            }
        },
        inPort = host.getMidiInPort(0),
        multiRc = new MultiRcPages(SIMULTANEOUSLY_MAPPED_RC_PAGES, CONTROLS_PER_PAGE);

    inPort.setMidiCallback(function(status, data1, data2) {
        var isCC = (status & 0xF0) === 0xB0,
            cc = data1,
            rcIndex;

        // println('MIDI: ' + status.toString(16) + '|' + data1.toString(16) + '|' + data2.toString(16));

        if (isCC) {
            if (data2 && cc === CC.PAGE_UP) {
                return multiRc.pageUp();
            }
            if (data2 && cc === CC.PAGE_DOWN) {
                return multiRc.pageDown();
            }
            if (cc >= CC.FIRST_CONTROL && cc <= CC.LAST_CONTROL) {
                rcIndex = cc - CC.FIRST_CONTROL;
                multiRc.setRcValue(rcIndex, data2);
            }
        }
    });

    println('go');
}

function exit() {}
