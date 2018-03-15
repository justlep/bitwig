/**
 * An event dispatcher for registering handlers to MIDI events like notes, CCs or sysex.
 * Supported events so far:
 *    - note
 *    - notePressed
 *    - noteReleased
 *    - cc
 *    - sysex
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * Usage:
 *     var midi = lep.MidiEventDispatcher.getInstance();  // by default using MidiInPort 0
 *
 *     midi.onNote(66, function(note, value) {
 *         println('note 66 was ' + value ? 'pressed' : 'released');
 *     });
 *     midi.onNotePressed(66, function(note, value) {
 *         println('note 66 was pressed');
 *     });
 *     midi.onNoteReleased(66, function(note, value) {
 *         println('note 66 was released');
 *     });
 *     midi.onCC(123, function(cc, value) {
 *         println('CC 123 value changed -> ' + value);
 *     });
 *     // or bind a whole range of notes..
 *     midi.onCC([71,78], function(cc, value) {
 *         println('CC '+ cc +' value changed -> ' + value);
 *     });
 */
(function () {

    var MAX_IN_PORT = 100,
        instancesByInPort = {},
        __usingGetInstance = false,
        contextSafe = function(fn, ctxOrEmpty) {
            return ctxOrEmpty ? lep.util.bind(fn, ctxOrEmpty) : fn;
        };

    /**
     * @param {number} inPortNumber - 0..100
     * @constructor
     */
    lep.MidiEventDispatcher = function(inPortNumber) {
        lep.util.assertNumberInRange(inPortNumber, 0, MAX_IN_PORT, 'Invalid inPortNumber "{}" for MidiEventDispatcher', inPortNumber);
        lep.util.assert(__usingGetInstance, 'Must use lep.MidiEventDispatcher.getInstance() to retrieve instances');
        __usingGetInstance = false;

        var inPort = host.getMidiInPort(inPortNumber),
            useStrictNoteOff = false,
            handlers = {
                note: [],
                notePressed: [],
                noteReleased: [],
                cc: [],
                sysex: []
            },
            /**
             * Each bit representing a midi channel for which channel-dependent handlers were bound.
             * To save CPU cycles checking for channel-dependent handlers if there are none, anyway.
             */
            boundChannelsBitmap = 0,
            getChannelDependentHandlerIndex = function (channel, noteOrCC) {
                return ((channel + 1) << 7) + noteOrCC;
            },
            addNoteOrCCHandler = function (handlerList, noteOrCC, callback, channel) {
                lep.util.assertArray(handlerList, 'Invalid handlerList for MED.addNoteOrCCHandler()');
                lep.util.assertNumberInRange(noteOrCC, 0, 127, 'Invalid noteOrCC {} for MED.addNoteOrCCHandler()', noteOrCC);
                lep.util.assertFunction(callback, 'Invalid callback for noteOrCC {}', noteOrCC);
                lep.util.assertNumberInRangeOrEmpty(channel, 0, 15, 'Invalid channel {} for noteOrCC {}', channel, noteOrCC);

                if (noteOrCC instanceof Array) {
                    for (var i = noteOrCC[0], lastNoteOrCC = noteOrCC[1]; i <= lastNoteOrCC; i++) {
                        addNoteOrCCHandler(handlerList, i, callback, channel);
                    }
                    return;
                }
                var useChannel = (typeof channel === 'number'),
                    handlerIndex = (useChannel) ? getChannelDependentHandlerIndex(channel, noteOrCC) : noteOrCC;

                boundChannelsBitmap |= (useChannel ? (1 << channel) : 0);

                if (handlerList[handlerIndex]) {
                    handlerList[handlerIndex].push(callback);
                    // lep.logDebug('MED bound handler for CC {}, channel {}', noteOrCC, channel);
                } else {
                    handlerList[handlerIndex] = [callback];
                    // lep.logDebug('MED bound handler for note {}, channel {}', noteOrCC, channel);
                }
            },
            DISPATCH_HANDLER = {
                MIDI: function (status, noteOrCC, prelimValue) {
                    // printMidi(status, noteOrCC, value);
                    var msgType = (status & 0xF0), // 0xB0 = CC, 0x90 = NOTE ON, 0x80 = NOTE OFF
                        channel = (status & 0xF),
                        value = prelimValue,
                        hasChannelDependentHandlers = (boundChannelsBitmap & (1 << channel)),
                        channelAwareIndex = hasChannelDependentHandlers && getChannelDependentHandlerIndex(channel, noteOrCC),
                        genericHandlers,
                        noteOnOffHandlers,
                        handlerIndex = noteOrCC,
                        i, len;

                    //lep.logDev('channel: {}, noteOrCC: {}, handlerIndex: {}, channelAwareIndex: {}',
                    //    channel.toString(16), noteOrCC.toString(16), handlerIndex.toString(16), channelAwareIndex.toString(16)
                    //);

                    // if strictNoteOff is disabled, just treat incoming NoteOff messages as NoteOn with value=0
                    if (msgType === 0x80 && !useStrictNoteOff) {
                        value = 0;
                        msgType = 0x90;
                    }

                    /*eslint no-constant-condition:0 */
                    while (true) {
                        if (msgType === 0xB0) { // CC
                            // lep.logDebug('MED received value {} on CC {} / channel {}', value, noteOrCC, channel);
                            genericHandlers = handlers.cc[handlerIndex];
                        } else if (msgType === 0x90) { // NOTE ON
                            genericHandlers = handlers.note[handlerIndex];
                            if (value || useStrictNoteOff) {
                                noteOnOffHandlers = handlers.notePressed[handlerIndex];
                            } else if (!useStrictNoteOff) {
                                noteOnOffHandlers = handlers.noteReleased[handlerIndex];
                            }
                        } else if (msgType === 0x80) { // NOTE OFF
                            noteOnOffHandlers = handlers.noteReleased[handlerIndex];
                        }

                        if (genericHandlers) {
                            // lep.logDebug('Invoking {} handlers for note/cc {}, handlerIndex: {}',
                            // genericHandlers.length, noteOrCC, handlerIndex);
                            for (i = 0, len = genericHandlers.length; i < len; i++) {
                                genericHandlers[i](noteOrCC, value, channel);
                            }
                        }
                        if (noteOnOffHandlers) {
                            // lep.logDebug('Invoking {} handlers for note {}, handlerIndex {}',
                            // noteOnOffHandlers.length, noteOrCC, handlerIndex);
                            for (i = 0, len = noteOnOffHandlers.length; i < len; i++) {
                                noteOnOffHandlers[i](noteOrCC, value, channel);
                            }
                        }

                        if (!channelAwareIndex || handlerIndex === channelAwareIndex) {
                            break;
                        }
                        handlerIndex = channelAwareIndex;
                        // lep.logDebug('MED checking channel-dependent handlers...');
                    }
                },
                SYSEX: function (sysexData) {
                    handlers.sysex.forEach(function (handler) {
                        handler(sysexData);
                    });
                }
            };

        // TODO add message type mask later if needed
        // noteOn -> '9x????'
        // noteOff -> '8x????'
        // aftertouchMask -> 'Ax????'
        // cc -> 'Bx????'
        // programChange -> 'Cx????'
        inPort.setMidiCallback(DISPATCH_HANDLER.MIDI);
        inPort.setSysexCallback(DISPATCH_HANDLER.SYSEX);

        /**
         * @callback NoteOrCCMessageHandler
         * @param {number} noteOrCc
         * @param {number} velocity value
         * @param {number} channel (0-based)
         */

        /**
         * Binds an event handler for all NOTE ON messages independent of value.
         * @param {number|number[]} noteOrRange - single note or array of min & max note to bind
         * @param {NoteOrCCMessageHandler} callback - e.g. function(note, value, channel){..}
         * @param {Object} [context] - (optional) this-context to use for invocation, can be falsy
         * @param {number} [channel] - (optional) MIDI channel 0-15 to listen to exclusively
         */
        this.onNote = function (noteOrRange, callback, context, channel) {
            addNoteOrCCHandler(handlers.note, noteOrRange, contextSafe(callback, context), channel);
        };

        /**
         * Bind an event handler for NOTE ON messages with values > 0.
         * @param {number|number[]} noteOrRange - single note or array of min & max note to bind
         * @param {NoteOrCCMessageHandler} callback - e.g. function(note, value, channel){..}
         * @param {Object} [context] - (optional) this-context to use for invocation, can be falsy
         * @param {number} [channel] - (optional) MIDI channel 0-15 to listen to exclusively
         */
        this.onNotePressed = function (noteOrRange, callback, context, channel) {
            addNoteOrCCHandler(handlers.notePressed, noteOrRange, contextSafe(callback, context), channel);
        };

        /**
         * Bind an event handler for both NOTE OFF messages and NOTE ON with value=0.
         * @param {number|number[]} noteOrRange - single note or array of min & max note to bind
         * @param {NoteOrCCMessageHandler} callback - e.g. function(note, value, channel){..},
         * @param {Object} [context] - (optional) this-context to use for invocation, can be falsy
         * @param {number} [channel] - (optional) MIDI channel 0-15 to listen to exclusively
         */
        this.onNoteReleased = function (noteOrRange, callback, context, channel) {
            addNoteOrCCHandler(handlers.noteReleased, noteOrRange, contextSafe(callback, context), channel);
        };

        /**
         * @param {number|number[]} ccOrRange - single cc-value or array of min & max cc to bind
         * @param {NoteOrCCMessageHandler} callback - e.g. function(cc, value, channel){..}
         * @param {Object} [context] - (optional) this-context to use for invocation, can be falsy
         * @param {number} [channel] - (optional) MIDI channel 0-15 to listen to exclusively
         */
        this.onCC = function (ccOrRange, callback, context, channel) {
            addNoteOrCCHandler(handlers.cc, ccOrRange, contextSafe(callback, context), channel);
        };

        /**
         * @param {function} callback - e.g. function(sysexData){..}
         * @param {Object} [context] - (optional) this-context to use for invocation, can be falsy
         */
        this.onSysex = function (callback, context) {
            handlers.sysex.push(contextSafe(callback, context));
        };

        /**
         * Creates a note input for the inPort either for a specific channel or OMNI.
         * TODO make configurable which messages to filter
         * @param {string} inputName - name of the input; the shorter the better
         * @param {number} [channel] - optional channel (0-15); non-number meaning OMNI
         * @param {boolean} [consumeEvents] - default=false
         * @return {NoteInput}
         */
        this.createNoteInput = function (inputName, channel, consumeEvents) {
            lep.util.assertString(inputName, 'Invalid inputName for MidiEventDispatcher.createNoteInput');
            lep.util.assertNumberInRangeOrEmpty(channel, 0, 15, 'Invalid channel for MidiEventDispatcher.createNoteInput');
            var channelMaskReplacement = (typeof channel === 'number') ? channel.toString(16) : '?',
                noteOnMask = '9x????'.replace('x', channelMaskReplacement),
                noteOffMask = '8x????'.replace('x', channelMaskReplacement),
                noteAftertouchMask = 'Ax????'.replace('x', channelMaskReplacement),
                ccMask = 'Bx????'.replace('x', channelMaskReplacement),
                programChangeMask = 'Cx????'.replace('x', channelMaskReplacement),
                noteInput = inPort.createNoteInput(inputName, noteOnMask, noteOffMask, noteAftertouchMask,
                    ccMask, programChangeMask);

            noteInput.setShouldConsumeEvents(!!consumeEvents);
            return noteInput;
        };

        /**
         * Toggles strict note-off handling.
         * If disabled (=default), both type of MIDI messages {NoteOff} AND {NoteOn@velocity=0} will
         * be interpreted as NoteOff (hence triggering any bound noteReleased-handlers).
         * Otherwise only explicit NoteOff midi messages will do.
         * @param {boolean} useStrict
         * @return {lep.MidiEventDispatcher} this instance
         */
        this.setStrictNoteOff = function(useStrict) {
            lep.util.assertBoolean(useStrict, 'Invalid useStrict "{}" for MidiEventDispatcher.setStrictNoteOff', useStrict);
            useStrictNoteOff = useStrict;
            return this;
        };
    };

    /**
     * Returns an instance of the MidiEventDispatcher responsible for one specific MidiInPort.
     * If a dispatcher for the given in-port was already created, the existing instance will be returned.
     *
     * @param {number} [midiInPort] - optional MidiInPort number to use (default: 0)
     * @return {lep.MidiEventDispatcher}
     * @static
     **/
    lep.MidiEventDispatcher.getInstance = function(midiInPort) {
        var inPort = midiInPort || 0;
        lep.util.assertNumber(inPort, 'Invalid midiInPort "{}" for lep.MidiEventDispatcher.getInstance', midiInPort);
        if (!instancesByInPort[inPort]) {
            __usingGetInstance = true;
            instancesByInPort[inPort] = new lep.MidiEventDispatcher(inPort);
        }
        return instancesByInPort[inPort];
    };

})();
