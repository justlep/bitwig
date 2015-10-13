loadAPI(1);

host.defineController('meme', 'UserControlTest', '1.0', '42577294-71a7-11e5-9d70-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(1, 0);

function init() {
    var CC = 25,
        userControls = host.createUserControls(1),
        control = userControls.getControl(0);

    control.setLabel('invertedControl');

    host.getMidiInPort(0).setMidiCallback(function(status, data1, data2) {
        printMidi(status, data1, data2);
        if (isChannelController(status) && data1 === CC) {
            println('Updating value of invertedControl to ' + (127 - data2));
            control.set(127 - data2, 128);
        }
    });
}

function exit() {}