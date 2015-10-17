loadAPI(1);

/**
 * Bug in Bitwig 1.2
 *
 * 1. Create new Project (2 audio or midi tracks, 1 effect track, 1 master)
 * 2. Change volume of track1
 *      -> console shows channel0 change -> OK
 * 3. Change volume of track2
 *     -> console shows channel1 change -> OK
 * 4. Group track1+1, then change volume of the group track
 *     -> console shows change in channel0 AND channel3 -> ??? what is channel3 ???
 *     There is no visible channel 3 in the GUI
 *     (group = channel0, groupedTrack1 = channel1, groupedTrack2 = channel2, effectTrack = channel4)
 */

host.defineController('meme', 'GhostGroupTrackTest', '1.0', '42577295-71a7-11e5-9d70-feff819cdc9f', 'github@justlep.net');
host.defineMidiPorts(0, 0);

function init() {
    var trackBank = host.createTrackBank(8, 0, 1);

    for (var i= 0; i<8; i++) {
        (function(channelIndex) {
            trackBank.getChannel(channelIndex).getVolume().addValueObserver(128, function(newValue) {
                println('Channel ' + channelIndex + ' changed value: ' + newValue);
            });
        })(i);
    }
}

function exit() {}