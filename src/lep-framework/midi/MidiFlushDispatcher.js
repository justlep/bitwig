/**
 * @constructor
 */
lep.MidiFlushDispatcher = function() {
    lep.util.assert(!lep.MidiFlushDispatcher._instance, 'Use lep.MidiFlushDispatcher.getInstance()');
    lep.MidiFlushDispatcher._instance = this;

    var ORIGINAL_FLUSH = (typeof flush !== 'undefined') ? flush : undefined,
        _isFirstFlushDone = false,
        _firstFlushFns = [],
        _outPort = null,
        _keyedMidiQueue = {},
        _queueNeedsFlush = true;

    try {
        _outPort = host.getMidiOutPort(0);
    } catch (err) {
        lep.logDebug('FlushDispatcher: no outPort');
    }

    function _subsequentFlushHandler() {
        if (_queueNeedsFlush) {
            var queueKeys = Object.keys(_keyedMidiQueue);
            // lep.logDev('Subsequent flush #{}.. queuedKeys = {}', lep.util.nextId(), queueKeys);
            for (var i = 0, len = queueKeys.length, queueKey, typeAndChannel, noteOrCC, rawVal; i < len; i++) {
                queueKey = queueKeys[i];
                rawVal = _keyedMidiQueue[queueKey];
                delete _keyedMidiQueue[queueKey];

                typeAndChannel = rawVal >> 16;
                noteOrCC = (rawVal >> 8) & 0xff;

                // lep.logDev('Sending {} {} {}', typeAndChannel.toString(16), noteOrCC.toString(16), rawVal & 0xff);

                _outPort.sendMidi(typeAndChannel, noteOrCC, rawVal & 0xff);
            }
            _queueNeedsFlush = false;
        }
        ORIGINAL_FLUSH && ORIGINAL_FLUSH();
    }

    function _firstFlushHandler() {
        for (var i = 0, len = _firstFlushFns.length; i < len; i++) {
            lep.logDebug('Invoking first-flush handler {} of {}', i+1, len);
            _firstFlushFns[i]();
        }
        _isFirstFlushDone = true;
        flush = _subsequentFlushHandler;
        lep.logDebug('Invoking regular flush handler..');
        flush();
        lep.logDebug('First flush finished');
    }

    /**
     * Register a callback to be invoked by the very first flush() triggered by Bitwig.
     * @param {function} handler
     */
    this.onFirstFlush = function(handler) {
        lep.util.assertFunction(handler, 'Invalid handler for MidiFlushDispatcher.onFirstFlush');
        lep.util.assert(!_isFirstFlushDone, 'Cannot add first-flush handler - first flush already happened');
        _firstFlushFns.push(handler);
        lep.logDebug('Registered first-flush handler');
    };

    /**
     * @param {number} channel - 0..15
     * @param {number} note - 0..127
     * @param {number} value - 0..127
     */
    this.enqueueNoteOn = function(channel, note, value) {
        var typeChannelNote = ((0x90 | channel) << 8) | note;
        _keyedMidiQueue[typeChannelNote] = (typeChannelNote << 8) | value;
        _queueNeedsFlush = true;
    };

    /**
     * @param {number} channel - 0..15
     * @param {number} cc - 0..127
     * @param {number} value - 0..127
     */
    this.enqueueCC = function(channel, cc, value) {
        var typeChannelCC = ((0xB0 | channel) << 8) | cc;
        _keyedMidiQueue[typeChannelCC] = (typeChannelCC << 8) | value;
        _queueNeedsFlush = true;
    };

    this.immediateNoteOn = function(channel, note, value) {
        _outPort.sendMidi(0x90 | channel, note, value);
    };

    this.immediateNoteOff = function(channel, note) {
        _outPort.sendMidi(0x80 | channel, note, 0);
    };

    this.immediateCC = function(channel, cc, value) {
        _outPort.sendMidi(0xB0 | channel, cc, value);
    };

    // set or replace the global flush callback with the dispatcher's handler
    flush = _firstFlushHandler;
};

/**
 * @return {lep.MidiFlushDispatcher}
 * @static
 */
lep.MidiFlushDispatcher.getInstance = function() {
    return lep.MidiFlushDispatcher._instance || new lep.MidiFlushDispatcher();
};

lep.MidiFlushDispatcher._instance = null;