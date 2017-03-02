/**
 * Loads all lep-API files in the right order.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

var lep = {};

load('../lib/knockout-stripped.js');

load('util/log.js');
load('util/util.js');

load('midi/MidiEventDispatcher.js');

load('control/BaseControl.js');
load('control/ClickEncoder.js');
load('control/Encoder.js');
load('control/Fader.js');
load('control/Button.js');
load('control/ControlSet.js');

load('value/BaseValue.js');
load('value/StandardRangedValue.js');
load('value/ValueSet.js');
load('value/ParamsValueSet.js');
load('value/ToggledValue.js');
load('value/ChannelSelectValue.js');
load('value/ToggledTransportValue.js');
load('value/KnockoutSyncedValue.js');

load('morpher/MorphWeightValue.js');
load('morpher/Morpher.js');


