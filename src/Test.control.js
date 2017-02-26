loadAPI('foo');

// @deprecationChecked:1.3.15
host.defineController('LeP', 'Test-Script', '2.0', '98eac9c6-68fb-11e5-9d70-feff819cd999', 'meme');
host.defineMidiPorts(0, 0);

function init() {

    println('trying...');

    var someSettableBoolean = host.createTransport().isPlaying();

    println('done');
}

function exit() {}
