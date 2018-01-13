/*global describe, it, beforeEach */

var chai = require('chai'),
    assert = chai.assert,
    spies = require('chai-spies'),
    expect = chai.expect;

// load lep-API and mocks into this context..
require('./../loadApiAndMocks');

chai.use(spies);

describe('lep.MidiEventDispatcher', function() {

    var med0,
        med1;

    beforeEach(function() {
        med0 = lep.MidiEventDispatcher.getInstance(0);
        med1 = lep.MidiEventDispatcher.getInstance(1);
    });

    it('creates one reused instance per inPort', function() {
        var medDefault = lep.MidiEventDispatcher.getInstance(),
            medDefault2 = lep.MidiEventDispatcher.getInstance(),
            med5_1 = lep.MidiEventDispatcher.getInstance(5),
            med5_2 = lep.MidiEventDispatcher.getInstance(5);

        assert.instanceOf(medDefault, lep.MidiEventDispatcher);
        assert.instanceOf(medDefault2, lep.MidiEventDispatcher);
        assert.instanceOf(med0, lep.MidiEventDispatcher);
        assert.instanceOf(med1, lep.MidiEventDispatcher);
        assert.instanceOf(med5_1, lep.MidiEventDispatcher);
        assert.instanceOf(med5_2, lep.MidiEventDispatcher);
        assert.strictEqual(medDefault, medDefault2);
        assert.strictEqual(medDefault, med0);
        assert.notStrictEqual(med0, med1);
        assert.strictEqual(med5_1, med5_2);
    });

    it('triggers channel-dependent and channel-independent note/CC handlers', function() {
        var CH_A = 1,
            CH_B = 13,
            SPY = {
                NOTE55A: {ON: chai.spy(), OFF: chai.spy()},
                NOTE77A: {ON: chai.spy(), OFF: chai.spy()},
                NOTE77_ANYCHANNEL: {ON: chai.spy(), OFF: chai.spy()},
                NOTE77_CHANNEL14: {ON: chai.spy(), OFF: chai.spy()},
                NOTE55B: {ON: chai.spy(), OFF: chai.spy()},
                NOTE77B: {ON: chai.spy(), OFF: chai.spy()},
                CC77_ANYCHANNEL: chai.spy(),
                CC77_CHANNEL15: chai.spy(),
                CC88A: chai.spy(),
                CC88B: chai.spy(),
                CC55A: chai.spy(),
                CC55B: chai.spy()
            };

        med0.onNotePressed(55, SPY.NOTE55A.ON, null, CH_A);
        med0.onNoteReleased(55, SPY.NOTE55A.OFF, null, CH_A);
        med0.onCC(88, SPY.CC88A);

        host.mockNoteOn(0, 55, 127, CH_A);
        expect(SPY.NOTE55A.ON).to.have.been.called.once();
        expect(SPY.NOTE55A.ON).to.have.been.called.with(55,127,CH_A);

        host.mockNoteOn(0, 55, 66, CH_A);
        expect(SPY.NOTE55A.ON).to.have.been.called.with(55,66,CH_A);
        expect(SPY.NOTE55A.ON).to.have.been.called.twice(); // different note should not call the handler

        host.mockNoteOn(0, 50, 127, CH_A);
        expect(SPY.NOTE55A.ON).to.have.been.called.twice();
        host.mockNoteOn(1, 55, 127, CH_A);
        expect(SPY.NOTE55A.ON).to.have.been.called.twice(); // different input should not call the handler

        expect(SPY.NOTE55B.ON).to.not.have.been.called();
        expect(SPY.NOTE55B.OFF).to.not.have.been.called();
        expect(SPY.NOTE77A.ON).to.not.have.been.called();
        expect(SPY.NOTE77A.OFF).to.not.have.been.called();
        expect(SPY.CC77_ANYCHANNEL).to.not.have.been.called();
        expect(SPY.CC77_CHANNEL15).to.not.have.been.called();

        host.mockNoteOn(0, 77, 127, CH_B); // wrong channel
        expect(SPY.NOTE77A.ON).to.not.have.been.called();
        expect(SPY.NOTE77A.OFF).to.not.have.been.called();
        expect(SPY.NOTE77_CHANNEL14.OFF).to.not.have.been.called();

        med0.onNotePressed(77, SPY.NOTE77_ANYCHANNEL.ON, null, null); // channel-independent
        med0.onNotePressed(77, SPY.NOTE77_CHANNEL14.ON, null, 14);      // channel-dependent
        med0.onCC(77, SPY.CC77_ANYCHANNEL, null, null);      // channel-independent
        med0.onCC(77, SPY.CC77_CHANNEL15, null, 15);      // channel-dependent

        // trigger notes and CCs on the "wrong" input
        for (let channel = 0, VALUE; channel <= 15; channel ++) {
            VALUE = (channel + 1) * 3;
            host.mockNoteOn(1, 77, VALUE, channel);
            host.mockCC(1, 77, VALUE, channel);
            expect(SPY.NOTE77_ANYCHANNEL.ON).to.not.have.been.called();
            expect(SPY.NOTE77_CHANNEL14.OFF).to.not.have.been.called();
        }
        for (let channel = 0, VALUE; channel <= 15; channel ++) {
            VALUE = (channel + 1) * 3;
            host.mockNoteOn(0, 77, VALUE, channel);
            expect(SPY.NOTE77_ANYCHANNEL.ON).to.have.been.called.with(77, VALUE, channel);
        }
        expect(SPY.NOTE77_ANYCHANNEL.ON).to.have.been.called.exactly(16);
        expect(SPY.NOTE77_ANYCHANNEL.OFF).to.not.have.been.called();
        expect(SPY.NOTE77_CHANNEL14.ON).to.have.been.called.exactly(1);
        expect(SPY.NOTE77_CHANNEL14.ON).to.have.been.called.with(77, (14+1)*3, 14);
        expect(SPY.NOTE77_CHANNEL14.OFF).to.not.have.been.called();

        // check CC handlers
        expect(SPY.CC77_ANYCHANNEL).to.not.have.been.called();
        expect(SPY.CC77_CHANNEL15).to.not.have.been.called();

        for (let channel = 0, VALUE; channel <= 15; channel ++) {
            VALUE = (channel + 1) * 3;
            host.mockCC(0, 77, VALUE, channel);
            expect(SPY.CC77_ANYCHANNEL).to.have.been.called.with(77, VALUE, channel);
            if (channel === 15) {
                expect(SPY.CC77_CHANNEL15).to.have.been.called.with(77, VALUE, 15);

            }
        }
        expect(SPY.CC77_ANYCHANNEL).to.have.been.called.exactly(16);
        expect(SPY.CC77_CHANNEL15).to.have.been.called.exactly(1);
    });

    it('ensures a handler\'s this-context if it was given to onXXX()', function() {
        var CTX = {},
            SPY = {
                CC77_NO_CTX: chai.spy(function() {
                    assert.notStrictEqual(this, CTX);
                }),
                CC77_WITH_CTX: chai.spy(function(){
                    assert.strictEqual(this, CTX);
                }),
                NOTE99_NO_CTX: chai.spy(function() {
                    assert.notStrictEqual(this, CTX);
                }),
                NOTE99_WITH_CTX: chai.spy(function(){
                    assert.strictEqual(this, CTX);
                })
            };

        med0.onCC(77, SPY.CC77_NO_CTX, null, null);
        med0.onCC(77, SPY.CC77_WITH_CTX, CTX, null);
        med0.onNotePressed(99, SPY.NOTE99_NO_CTX, null, null);
        med0.onNotePressed(99, SPY.NOTE99_WITH_CTX, CTX, null);

        host.mockCC(0, 77, 55, 14);
        host.mockNoteOn(0, 99, 123, 11);
        
        expect(SPY.CC77_NO_CTX).to.have.been.called.exactly(1);
        expect(SPY.CC77_WITH_CTX).to.have.been.called.exactly(1);

        expect(SPY.NOTE99_NO_CTX).to.have.been.called.exactly(1);
        expect(SPY.NOTE99_WITH_CTX).to.have.been.called.exactly(1);
    });

    it('triggers noteReleased-handlers on zero-values depending on strictNoteOff', function() {
        var PORT_STRICT = 20,
            PORT_LOOSE = 21,
            NOTE = 55,
            CHANNEL = 7,
            OTHERCHANNEL = 15,
            strictMED = lep.MidiEventDispatcher.getInstance(PORT_STRICT).setStrictNoteOff(true),
            looseMED= lep.MidiEventDispatcher.getInstance(PORT_LOOSE),
            SPY = {
                STRICT_ON: chai.spy(),
                STRICT_OFF: chai.spy(),
                LOOSE_ON: chai.spy(),
                LOOSE_OFF: chai.spy()
            };

        assert.notStrictEqual(strictMED, looseMED);

        // test strictNoteOff mode (i.e. notePressed-messages with value=0 will NOT trigger noteReleased-handlers)

        strictMED.onNotePressed(NOTE, SPY.STRICT_ON);
        strictMED.onNoteReleased(NOTE, SPY.STRICT_OFF);

        host.mockNoteOn(PORT_STRICT, NOTE, 0, CHANNEL);
        expect(SPY.STRICT_ON).to.have.been.called.once();
        expect(SPY.STRICT_OFF).to.not.have.been.called();
        host.mockNoteOn(PORT_STRICT, NOTE, 123, CHANNEL);
        expect(SPY.STRICT_ON).to.have.been.called.exactly(2);
        expect(SPY.STRICT_OFF).to.not.have.been.called();
        host.mockNoteOff(PORT_STRICT, NOTE, 0, CHANNEL);
        expect(SPY.STRICT_ON).to.have.been.called.exactly(2);
        expect(SPY.STRICT_OFF).to.have.been.called.once();
        expect(SPY.STRICT_OFF).to.have.been.called.with(NOTE, 0, CHANNEL);


        // test non-strictNoteOff mode (i.e. notePressed-messages with value=0 DO trigger noteReleased-handlers)

        looseMED.onNotePressed(NOTE, SPY.LOOSE_ON);
        looseMED.onNoteReleased(NOTE, SPY.LOOSE_OFF);

        host.mockNoteOn(PORT_LOOSE, NOTE, 0, CHANNEL);
        expect(SPY.LOOSE_ON).to.not.have.been.called();
        expect(SPY.LOOSE_OFF).to.have.been.called.once();
        host.mockNoteOn(PORT_LOOSE, NOTE, 123, CHANNEL);
        expect(SPY.LOOSE_ON).to.have.been.called.once();
        expect(SPY.LOOSE_OFF).to.have.been.called.once();
        host.mockNoteOff(PORT_LOOSE, NOTE, 0, CHANNEL);
        expect(SPY.LOOSE_ON).to.have.been.called.once();
        expect(SPY.LOOSE_OFF).to.have.been.called.exactly(2);
        expect(SPY.LOOSE_OFF).to.have.been.called.with(NOTE, 0, CHANNEL);
        host.mockNoteOff(PORT_LOOSE, NOTE, 0, OTHERCHANNEL);
        expect(SPY.LOOSE_OFF).to.have.been.called.exactly(3);
        expect(SPY.LOOSE_OFF).to.have.been.called.with(NOTE, 0, OTHERCHANNEL);
    });
});