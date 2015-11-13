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
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
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
lep.MidiEventDispatcher = (function () {

    var instancesByInPort = {},
        DEFAULT_OPTS = {
            midiInPort: 0,
            // if true, only explicit NOTE OFF messages (0x80) will be interpreted as note off event,
            // otherwise both explicit NOTE OFF and NOTE ON (0x90) with value=0 trigger note-off handlers
            strictNoteOff: false
        },
        getInstance = function(opts) {
            lep.util.assertObjectOrEmpty(opts, 'Invalid opts for MidiEventDispatcher.getInstance');
            var instanceOpts = lep.util.extend({}, DEFAULT_OPTS, opts||{}),
                inPortNumber = instanceOpts.midiInPort;

            if (!instancesByInPort[inPortNumber]) {
                instancesByInPort[inPortNumber] = createInstance(inPortNumber, instanceOpts);
            }
            return instancesByInPort[inPortNumber];
        },
        createInstance = function(inPortNumber, opts) {
            var inPort = host.getMidiInPort(inPortNumber),
                useStrictNoteOff = !!opts.strictNoteOff,
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
                invokeHandlers = function(handlerList, noteOrCC, value, channel) {
                    for (var i = 0, len = handlerList.length; i < len; i++) {
                        handlerList[i](noteOrCC, value, channel);
                    }
                },
                getChannelDependentHandlerIndex = function(channel, noteOrCC) {
                    return ((channel + 1) << 7) + noteOrCC;
                },
                addNoteOrCCHandler = function(handlerList, noteOrCC, callback, channel) {
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
                    MIDI: function(status, noteOrCC, value) {
                        // printMidi(status, noteOrCC, value);
                        var msgType = (status & 0xF0), // 0xB0 = CC, 0x90 = NOTE ON, 0x80 = NOTE OFF
                            channel = (status & 0xF),
                            hasChannelDependentHandlers = (boundChannelsBitmap & (1 << channel)),
                            channelAwareIndex =  hasChannelDependentHandlers && getChannelDependentHandlerIndex(channel, noteOrCC),
                            genericHandlers,
                            noteOnOffHandlers,
                            handlerIndex = noteOrCC;

                        //lep.logDev('channel: {}, noteOrCC: {}, handlerIndex: {}, channelAwareIndex: {}',
                        //    channel.toString(16), noteOrCC.toString(16), handlerIndex.toString(16), channelAwareIndex.toString(16)
                        //);

                        while (true) {
                            if (msgType === 0xB0) { // CC
                                lep.logDebug('MED received value {} on CC {} / channel {}', value, noteOrCC, channel);
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
                                invokeHandlers(genericHandlers, noteOrCC, value, channel);
                            }
                            if (noteOnOffHandlers) {
                                // lep.logDebug('Invoking {} handlers for note {}, handlerIndex {}',
                                // noteOnOffHandlers.length, noteOrCC, handlerIndex);
                                invokeHandlers(noteOnOffHandlers, noteOrCC, value, channel);
                            }

                            if (!channelAwareIndex || handlerIndex === channelAwareIndex) {
                                break;
                            }
                            handlerIndex = channelAwareIndex;
                            // lep.logDebug('MED checking channel-dependent handlers...');
                        }
                    },
                    SYSEX: function(sysexData) {
                        handlers.sysex.forEach(function(handler) {
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

            return {
                /**
                 * Binds an event handler for all NOTE ON messages independent of value.
                 * @param noteOrRange (Number|Array[2]) single note or array of min/max note to bind
                 * @param callback (function) e.g. function(note, value, channel){..}
                 * @param [context] (Object) (optional) this-context to use for invocation, can be falsy
                 * @param [channel] (Number) (optional) MIDI channel 0-15 to listen to exclusively
                 */
                onNote: function(noteOrRange, callback, context, channel) {
                    addNoteOrCCHandler(handlers.note, noteOrRange, contextSafe(callback, context), channel);
                },
                /**
                 * Bind an event handler for NOTE ON messages with values > 0.
                 * @param noteOrRange (Number|Array[2]) single note or array of min/max note to bind
                 * @param callback (function) e.g. function(note, value, channel){..}
                 * @param [context] (Object) (optional) this-context to use for invocation, can be falsy
                 * @param [channel] (Number) (optional) MIDI channel 0-15 to listen to exclusively
                 */
                onNotePressed: function(noteOrRange, callback, context, channel) {
                    addNoteOrCCHandler(handlers.notePressed, noteOrRange, contextSafe(callback, context), channel);
                },
                /**
                 * Bind an event handler for both NOTE OFF messages and NOTE ON with value=0.
                 * @param noteOrRange (Number|Array[2]) single note or array of min/max note to bind
                 * @param callback (function) e.g. function(note, value, channel){..},
                 * @param [context] (Object) (optional) this-context to use for invocation, can be falsy
                 * @param [channel] (Number) (optional) MIDI channel 0-15 to listen to exclusively
                 */
                onNoteReleased: function(noteOrRange, callback, context, channel) {
                    addNoteOrCCHandler(handlers.noteReleased, noteOrRange, contextSafe(callback, context), channel);
                },
                /**
                 * @param ccOrRange (Number|Array[2]) single note or array of min/max note to bind
                 * @param callback (function) e.g. function(cc, value, channel){..}
                 * @param [context] (Object) (optional) this-context to use for invocation, can be falsy
                 * @param [channel] (Number) (optional) MIDI channel 0-15 to listen to exclusively
                 */
                onCC: function(ccOrRange, callback, context, channel) {
                    addNoteOrCCHandler(handlers.cc, ccOrRange, contextSafe(callback, context), channel);
                },
                /**
                 * @param callback (function) e.g. function(sysexData){..}
                 * @param [context] (Object) (optional) this-context to use for invocation, can be falsy
                 */
                onSysex: function(callback, context) {
                    handlers.sysex.push(contextSafe(callback, context));
                },
                /**
                 * Creates a note input for the inPort either for a specific channel or OMNI.
                 * TODO make configurable which messages to filter
                 * @param inputName (String) name of the input; the shorter the better
                 * @param [channel] (Number) optional channel (0-15); non-number meaning OMNI
                 * @param [consumeEvents] (boolean) default=false
                 */
                createNoteInput: function(inputName, channel, consumeEvents) {
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
                }
            };
        },
        /**
         * Wraps a given function into a closure with 'this'-context bound to the given context.
         * If the context is empty, the function itself is returned.
         * @param fn (function) the function to wrap
         * @param [ctxOrEmpty] (object) optional object for the this-context; can be empty/falsy
         * @return (function)
         */
        contextSafe = function(fn, ctxOrEmpty) {
            return ctxOrEmpty ? lep.util.bind(fn, ctxOrEmpty) : fn;
        };


    return {
        /**
         * Returns an instance of the dispatcher for a given MidiInPort.
         * Only ONE instance per port will be created.
         *
         * @param opts (Object) (optional) contains optional configuration properties overriding {@link DEFAULT_OPTS}
         *              - midiInPort (Number) the MidiInPort number to use (default: 0)
         *              - strictNoteOff (boolean) If FALSE (default), both NOTE OFF messages *and* NOTE ON messages
         *                                        with value=0 will trigger noteReleased handlers.
         *                                        If TRUE, only explicit NOTE OFF messages will trigger
         *                                        noteReleased handlers.
         * @static
         **/
        getInstance: getInstance
    };
})();