/*global describe, it, beforeEach, RangedValueMock */

var chai = require('chai'),
    assert = chai.assert,
    spies = require('chai-spies'),
    expect = chai.expect;

// load lep-API and mocks into this context..
require('./../loadApiAndMocks');

chai.use(spies);

describe('lep.StandardRangedValue', function() {

    beforeEach(function() {
        lep.setLogLevel(lep.LOGLEVEL.WARN);
        lep.StandardRangedValue.globalTakeoverEnabled(false);
    });

    it('follows received absolute values when takeover is disabled', function() {
        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue
            });

        rangedValue.set(22);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(55);
        assert.strictEqual(s.value, 55);
        s.onAbsoluteValueReceived(66);
        assert.strictEqual(s.value, 66);
    });

    it('follows received absolute values from BIdirectional control with takeover ENABLED', function() {
        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue,
                isTakeoverEnabled: true
            });

        rangedValue.set(22); // simulate value-update from bitwig
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(10);
        assert.strictEqual(s.value, 10);
        s.onAbsoluteValueReceived(20);
        assert.strictEqual(s.value, 20);
        s.onAbsoluteValueReceived(22);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(40);
        assert.strictEqual(s.value, 40);
        s.onAbsoluteValueReceived(40);
        s.onAbsoluteValueReceived(40);
        s.onAbsoluteValueReceived(40);
        assert.strictEqual(s.value, 40);
        rangedValue.set(30);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(39);
        assert.strictEqual(s.value, 39);
        s.onAbsoluteValueReceived(29);
        assert.strictEqual(s.value, 29);
    });

    // TEST#3
    it('follows received absolute values from UNIdirectional control with takeover ENABLED', function() {
        // lep.setLogLevel(lep.LOGLEVEL.DEV);

        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue,
                isTakeoverEnabled: true
            });

        rangedValue.set(22); // simulate value-update from bitwig
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(10, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(20, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(21, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(22, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(40, true);
        assert.strictEqual(s.value, 40);
        rangedValue.set(30); // simulate manual change in Bitwig
        s.onAbsoluteValueReceived(39, true);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(31, true);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(29, true);
        assert.strictEqual(s.value, 29);
    });

    it('re-calculates takeover-range upon all non-controller-changes', function() {
        // lep.setLogLevel(lep.LOGLEVEL.DEV);

        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue,
                isTakeoverEnabled: true
            });

        rangedValue.set(22); // simulate value-update from bitwig
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(10, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(20, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(21, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(22, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(40, true);
        assert.strictEqual(s.value, 40);
        rangedValue.set(30); // simulate manual change in Bitwig
        s.onAbsoluteValueReceived(39, true); // <-- this generates take over range 0-30
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(39, true);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(31, true);
        assert.strictEqual(s.value, 30);

        rangedValue.set(50);                 // <-- invalidates the old sync status & range
        s.onAbsoluteValueReceived(29, true); // <-- this should trigger re-calculation of the takeover-range => 50-127
        assert.strictEqual(s.value, 50);
        s.onAbsoluteValueReceived(49, true);
        assert.strictEqual(s.value, 50);
        s.onAbsoluteValueReceived(51, true);
        assert.strictEqual(s.value, 51);
    });

    it('follows received absolute values from UNIdirectional control with takeover DISABLED', function() {
        // lep.setLogLevel(lep.LOGLEVEL.DEV);

        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue
            });

        rangedValue.set(22); // simulate value-update from bitwig
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(10, true);
        assert.strictEqual(s.value, 10);
        s.onAbsoluteValueReceived(20, true);
        assert.strictEqual(s.value, 20);
        s.onAbsoluteValueReceived(21, true);
        assert.strictEqual(s.value, 21);
        s.onAbsoluteValueReceived(22, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(40, true);
        assert.strictEqual(s.value, 40);
        rangedValue.set(30); // simulate manual change in Bitwig
        s.onAbsoluteValueReceived(39, true);
        assert.strictEqual(s.value, 39);
        s.onAbsoluteValueReceived(31, true);
        assert.strictEqual(s.value, 31);
        s.onAbsoluteValueReceived(29, true);
        assert.strictEqual(s.value, 29);
    });

    // This is a copy of TEST#3, except takeoverEnabed is set global AFTER instantiation
    it('can toggle takeover for ALL existing instances via static globalTakeoverEnabled()', function() {
        // lep.setLogLevel(lep.LOGLEVEL.DEV);

        var rangedValue = new RangedValueMock(),
            s = new lep.StandardRangedValue({
                name: 'myStdRgdValue',
                rangedValue: rangedValue
            });

        lep.StandardRangedValue.globalTakeoverEnabled(true); // <-- toggle takeover mode for all existing instances

        rangedValue.set(22); // simulate value-update from bitwig
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(10, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(20, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(21, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(22, true);
        assert.strictEqual(s.value, 22);
        s.onAbsoluteValueReceived(40, true);
        assert.strictEqual(s.value, 40);
        rangedValue.set(30); // simulate manual change in Bitwig
        s.onAbsoluteValueReceived(39, true);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(31, true);
        assert.strictEqual(s.value, 30);
        s.onAbsoluteValueReceived(29, true);
        assert.strictEqual(s.value, 29);
    });
});