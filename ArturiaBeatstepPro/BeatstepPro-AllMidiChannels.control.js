/**
 * Simple Bitwig controller script for Artuia Beatstep Pro.
 *
 * What it does:
 *   - Adds Beatstep's three sequencers as selectable MIDI inputs ("BSP-S1", "BSP-S2" and "BSP-DRUM"),
 *     using extra short names, so it's more easy to spot which track they are assigned to.
 *     (Names are only sensible if you use Beatstep's default settings where Sequencer1 is using MIDI channel 1,
 *     Sequencer2 using channel 2 and Drum sequencer on MIDI channel 10)
 *   - The other MIDI channels are added as selectable MIDI inputs, too: "BSP-3" to "BSP-9" and "BSP-11" to "BSP-16"
 *   - Sends Bitwig's MIDI clock to the Beatstep, so Beatstep can be switched to "USB" sync mode and, thus,
 *     will start/stop/run synchronously with Bitwig.
 *   - Knobs in control mode are mappable. However, as Beatstep Pro doesn't seem to receive CC messages,
 *     value changes made manually in the Bitwig GUI won't update the value of the mapped Beatstep knob :(.
 *
 * - [DONE] re-check if BeatstepPro really cannot receive CCs
 *          => reply from Arturia saying that BSP's values cannot be updated via CC messages ;-(
 *
 * TODO: check if PLAY/STOP button can control Bitwig even in USB sync mode (weird things happening when I tried)
 */

loadAPI(1);

host.defineController("Arturia Beatstep Pro (All channels)", "BSP", "1.1", "6ae51caa-3310-11e5-a151-feff819cdc9f", "github@justlep.net");
host.defineMidiPorts(1, 1);

// Leaving autodetection for the minimal version
// host.addDeviceNameBasedDiscoveryPair(["Arturia BeatStep Pro"], ["Arturia BeatStep Pro"]);


// CC 0 and CCs 120+ are reserved
var SHOW_STANDARD_INPUTS_ONLY = false,
    FIRST_MAPPED_CC_CHANNEL = 1,
    LAST_MAPPED_CC_CHANNEL = 16, // by default, beatstep pro sends CCs on channel 1
    TOTAL_CC_CHANNELS = (LAST_MAPPED_CC_CHANNEL - FIRST_MAPPED_CC_CHANNEL + 1),
    LOWEST_CC = 1,
    HIGHEST_CC = 119,
    TOTAL_CC_MESSAGES_PER_CHANNEL = (HIGHEST_CC - LOWEST_CC + 1),
    TOTAL_CC_MESSAGES = (TOTAL_CC_MESSAGES_PER_CHANNEL * TOTAL_CC_CHANNELS),
    CC_MESSAGES = {
        STOP: 51,
        PLAY: 54
    },
    CC_RESOLUTION = 128,
    SYSEX_MESSAGES = {
        START: 0xfa,
        STOP: 0xfc,
        CONTINUE: 0xfb
    },
    INPUT_NAMES = {
        0: 'ALL',
        1: 'S1',
        2: 'S2',
        10: 'DRUM'
    },
    NOTE_INPUT_CHANNEL_ORDER = (SHOW_STANDARD_INPUTS_ONLY) ? [1,2,10,0] : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,0],
// Two variables to hold the Values of all the CCs and to check if they have changed
// ccValues = initArray(0, TOTAL_CC_MESSAGES),
// ccValuesOld = initArray(0, TOTAL_CC_MESSAGES),
    transport,
    userControls,
    inPort,
    outPort;

/*
 // A function to create an indexed function for the Observers
 function getCCValueObserverFunc(index) {
 return function (value) {
 // println('observer -> ' + value);
 ccValues[index] = value;
 }
 }
 */

function getIndexByChannelAndCC(channel, cc) {
    return ((channel - 1) * TOTAL_CC_MESSAGES_PER_CHANNEL) + cc - LOWEST_CC;
}

function createNoteInput(channel, inputName) {
    var channelMaskReplacement = (!channel) ? '?' : (channel - 1).toString(16),
        noteOnMask = '9x????'.replace('x', channelMaskReplacement),
        noteOffMask = '8x????'.replace('x', channelMaskReplacement),
        noteAftertouchMask = 'Ax????'.replace('x', channelMaskReplacement),
        noteCCMask = 'Bx????'.replace('x', channelMaskReplacement),
        noteInput = inPort.createNoteInput(inputName, noteOnMask, noteOffMask, noteAftertouchMask, noteCCMask);

    noteInput.setShouldConsumeEvents(false);
}

function init() {

    transport = host.createTransport();
    userControls = host.createUserControls(TOTAL_CC_MESSAGES);
    inPort = host.getMidiInPort(0);
    outPort = host.getMidiOutPort(0);

    // Enable Midi Beat Clock. Comment out if you don't want that
    outPort.setShouldSendMidiBeatClock(true);

    for (var i = 0, channel, inputName; i < NOTE_INPUT_CHANNEL_ORDER.length; i++) {
        channel = NOTE_INPUT_CHANNEL_ORDER[i];
        inputName = INPUT_NAMES[channel] || channel;
        createNoteInput(channel, inputName);
    }

    // Setting Callbacks for Midi and Sysex

    inPort.setMidiCallback(onMidi);
    inPort.setSysexCallback(onSysex);

    for (var channel = FIRST_MAPPED_CC_CHANNEL; channel <= LAST_MAPPED_CC_CHANNEL; channel++) {
        for (var cc = LOWEST_CC; cc <= HIGHEST_CC; cc++) {
            var index = getIndexByChannelAndCC(channel, cc),
                ccControl = userControls.getControl(index);

            // TODO maybe filter PLAY+STOP CCs here

            // Set a label/name for each userControl
            ccControl.setLabel("CC " + cc + " - Channel " + channel);

            // NO observer needed as Beatstep ignores CC messages, anyway
            // Add a ValueObserver for each userControl
            // ccControl.addValueObserver(CC_RESOLUTION, getCCValueObserverFunc(index));
        }
    }
}

/*
 // IMO BeatstepPro is not capable of receiving CC messages, so updating it via flush makes no sense :(
 //
 // Updates the controller in an orderly manner when needed
 // so that LEDs, Motors etc. react to changes in the Software
 // without drowning the Controller with data
 function flush() {
 for (var channel = FIRST_MAPPED_CC_CHANNEL; channel <= LAST_MAPPED_CC_CHANNEL; channel++) {
 for (var cc = LOWEST_CC; cc <= HIGHEST_CC; cc++) {
 var index = getIndexByChannelAndCC(channel, cc),
 latestValue = ccValues[index],
 hasValueChanged = (latestValue !== ccValuesOld[index])

 if (hasValueChanged) {
 // println('Flushing: old: '+ccValuesOld[index]+', new: ' + latestValue);
 // If changed, send the updated value -> mm
 sendChannelController(channel - 1, cc, latestValue);
 ccValuesOld[index] = latestValue;
 }
 }
 }
 }
 */

// Update the UserControlls when Midi Data is received
function onMidi(status, data1, data2) {
    //printMidi(status, data1, data2);
    var ccChannel = (isChannelController(status) || 0) && (MIDIChannel(status) + 1),
        isSupportedCCMessage = ccChannel >= FIRST_MAPPED_CC_CHANNEL && ccChannel <= LAST_MAPPED_CC_CHANNEL && data1 >= LOWEST_CC && data1 <= HIGHEST_CC,
        index = isSupportedCCMessage && getIndexByChannelAndCC(ccChannel, data1);

    if (isSupportedCCMessage) {
        // data1 == cc, data2 == value
        // println("Received CC " + data1 + " with value " + data2);

        // println('onMidi  -> ' + data2);

        if (data1 == CC_MESSAGES.PLAY && data2 && ccChannel == 1) {
            // println('PLAY');
            // transport.play();
        } else if (data1 == CC_MESSAGES.STOP && data2 && ccChannel == 1) {
            // println('STOP');
            // transport.stop();
        } else {
            userControls.getControl(index).set(data2, CC_RESOLUTION);
        }
    }
}


function onSysex(data) {
    // println(data);
    /*
     printSysex(data);
     switch (data) {
     case SYSEX_MESSAGES.START:
     transport.restart();
     break;
     case SYSEX_MESSAGES.STOP:
     transport.stop();
     break;
     case SYSEX_MESSAGES.CONTINUE:
     transport.play();
     }
     */
}

function exit() {
    // nothing to see here :-)
}
