/**
 * Simple Bitwig controller script for Artuia Beatstep Pro.
 *
 * What it does:
 *   - Adds Beatstep's three sequencers as selectable MIDI inputs ("BSP-S1", "BSP-S2" and "BSP-DRUM"),
 *     using extra short names, so it's more easy to see which track they are assigned to
 *   - Sends Bitwig's MIDI clock to the Beatstep, so Beatstep can be switched to Sync mode "USB" and thus
 *     will start/stop/run synchronously with Bitwig.
 *   - Knobs in control mode are mappable. However, as Beatstep Pro doesn't seem to receive CC messages,
 *     value changes made manually in the Bitwig GUI won't update the value of the mapped Beatstep knob :(.
 *
 * Only the default settings of Beatstep Pro are currently supported, i.e. Sequencer1 on MIDI channel 1, Seq2 on CH2
 * and drums on CH10.
 *
 * TODO: maybe add the remaining 13 channels later.
 * TODO: re-check if BeatstepPro really cannot receive CCs.
 *
 * Originally based on Thomas Helzle's TomsMultiBiController:
 * https://github.com/ThomasHelzle/Toms_Bitwig_Scripts/tree/master/TomsGeneric
 */

loadAPI(1);

host.defineController("Arturia Beatstep Pro", "BSP", "1.0", "f87a78-d9f0-11e3-9c1a-0800123c9a66", "justlep");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Arturia BeatStep Pro"], ["Arturia BeatStep Pro"]);


// CC 0 and CCs 120+ are reserved
var FIRST_MAPPED_CC_CHANNEL = 1,
    LAST_MAPPED_CC_CHANNEL = 1, // IMHO beatstep pro sends CC messages on channel 1 only, so
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

function init() {

    transport = host.createTransport();
    userControls = host.createUserControls(TOTAL_CC_MESSAGES);
    inPort = host.getMidiInPort(0);
    outPort = host.getMidiOutPort(0);

    // Create 16 NoteInputs + Omni. Verbose to allow commenting out unneeded channels
    var noteInputS1 = inPort.createNoteInput("S1", "?0????"),
        noteInputS2 = inPort.createNoteInput("S2", "?1????"),
        noteInputDrums = inPort.createNoteInput("DRUM", "?9????");

    // Disable the consuming of the events by the NoteInputs, so they are also available for mapping
    noteInputS1.setShouldConsumeEvents(false);
    noteInputS2.setShouldConsumeEvents(false);
    noteInputDrums.setShouldConsumeEvents(false);

    // Enable Midi Beat Clock. Comment out if you don't want that
    outPort.setShouldSendMidiBeatClock(true);

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
        userControls.getControl(index).set(data2, CC_RESOLUTION);

        /*
         if (0)
         switch (data1) {
         case CC_MESSAGES.PLAY:
         // data2 && transport.play();
         break;
         case CC_MESSAGES.STOP:
         // data2 && transport.stop();
         break;
         default:
         userControls.getControl(index).set(data2, 128);
         }
         */
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
