/**
 * Bitwig Controller Script for the Arturia Beatstep Pro
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * What it does:
 *   - Adds Beatstep's three sequencers as selectable MIDI inputs (S1, S2 and DRUM),
 *     (Names are only sensible if you use Beatstep's default settings where Sequencer1 is using MIDI channel 1,
 *     Sequencer2 using channel 2 and Drum sequencer on MIDI channel 10)
 *   - The other MIDI channels are added as selectable MIDI inputs 3-9 and 11-16
 *   - If Bitwig 2.1 is the clock master, the Beatstep Pro must be switched to "USB" sync mode.
 *   - Knobs in control mode are mappable. However, as Beatstep Pro doesn't seem to receive CC messages,
 *     value changes made manually in the Bitwig GUI won't update the value of the mapped Beatstep encoder :(.
 *
 * - [DONE] re-check if BeatstepPro really cannot receive CCs
 *          => reply from Arturia saying BSP's values cannot be updated via CC messages ;-(
 */

loadAPI(6);
load('lep-framework/complete.js');
load('beatsteppro/BeatstepPro.js');

host.defineController('Arturia', 'Beatstep Pro [All]', '2.1', '6ae51caa-3310-11e5-a151-feff819ffc9f', 'Lennart Pegel');
// host.addDeviceNameBasedDiscoveryPair(['Arturia BeatStep Pro'], ['Arturia BeatStep Pro']);
host.defineMidiPorts(1, 1);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.WARN);
    /*global BeatstepPro */
    BeatstepPro.getInstanceForAllChannels();
    println('\n-------------\nBeatstepPro ready (all channels)');
}

/** @override */
function exit() {}
