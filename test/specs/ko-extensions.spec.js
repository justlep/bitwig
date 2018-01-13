/*global describe, it, beforeEach */

var assert = require('chai').assert;

// load lep-API and mocks into this context..
require('./../loadApiAndMocks');

lep.setLogLevel(lep.LOGLEVEL.WARN);

describe('ko-extensions.js', function() {

    it('adds a `toggle` method to the subscribable prototype', function() {
        var _co = ko.observable(),
            o1 = ko.observable(),
            o2 = ko.observable(),
            c1 = ko.computed({
                read: _co,
                write: function(v) {
                    _co(v);
                }
            }),
            c2 = ko.computed(function() {
                return null;
            }),
            o1ToggleFn = o1.toggle;

        assert.isFunction(o1.toggle);
        assert.isFunction(c1.toggle);
        assert.strictEqual(o1.toggle, o2.toggle); // toggle is shared
        assert.strictEqual(o1.toggle, c1.toggle);  // toggle is shared
        assert.throws(function() { // prove that this toggle method is not execution-context-safe
            o1ToggleFn();
        });
        assert.throws(function() { // prove that toggling a non-writeable computed fails
            c2.toggle();
        });
        c1.toggle();
        assert.strictEqual(c1(), true);
        c1.toggle();
        assert.strictEqual(c1(), false);
    });

    it('defines a `toggleable` extender that adds toggle, toggleOn, toggleOff methods', function() {
        var o1 = ko.observable(),
            o2 = ko.observable().extend({toggleable: true}),
            o3 = ko.observable(123).extend({toggleable: true});

        assert.isDefined(o1.toggle); // toggle stemming from prototype
        assert.isDefined(o2.toggle); // toggle added by extender
        assert.isDefined(o3.toggle); // toggle added by extender

        assert.notStrictEqual(o1.toggle, o2.toggle);
        assert.notStrictEqual(o1.toggle, o3.toggle);
        assert.notStrictEqual(o2.toggle, o3.toggle);

        assert.isUndefined(o1.toggleOn);
        assert.isUndefined(o1.toggleOff);
        assert.isFunction(o2.toggleOn);
        assert.isFunction(o2.toggleOff);

        o2.toggle();
        assert.strictEqual(o2(), true);
        o2.toggle();
        assert.strictEqual(o2(), false);
        o2.toggleOff();
        assert.strictEqual(o2(), false);
        o2.toggleOff();
        assert.strictEqual(o2(), false);
        o2.toggleOn();
        assert.strictEqual(o2(), true);
        o2.toggleOn();
        assert.strictEqual(o2(), true);
        assert.strictEqual(o3(), 123);
        o3.toggleOff();
        assert.strictEqual(o3(), false);
        o3.toggleOn();
        assert.strictEqual(o3(), true);
    });

    it('provides readonly access to the previous value via previousValue', function() {
        var o1 = ko.observable(),
            o2 = ko.observable().extend({restoreable: true});

        assert.isUndefined(o1.previousValue);
        assert.isUndefined(o2.previousValue);
        o1(11);
        o2(22);
        assert.isUndefined(o1.previousValue);
        assert.isUndefined(o2.previousValue);
        o1(111);
        o2(222);
        assert.isUndefined(o1.previousValue);
        assert.strictEqual(o2.previousValue, 22);
        assert.strictEqual(o2(), 222);
        o2.restore();
        assert.strictEqual(o2(), 22);
        assert.strictEqual(o2.previousValue, 222);
        o2.previousValue = 666;
        // previousValue is readonly, so the previous assignment should have no effect
        assert.strictEqual(o2.previousValue, 222);
    });

    it('can restore previous values using the restoreable extender', function() {
        var o1 = ko.observable().extend({restoreable: true}),
            o2 = ko.observable(5).extend({restoreable: true});

        assert.isFunction(o1.restore);
        assert.isFunction(o2.restore);
        assert.strictEqual(o1(), undefined);
        assert.strictEqual(o2(), 5);
        o1.restore();
        o2.restore();
        assert.strictEqual(o1(), undefined);
        assert.strictEqual(o2(), 5);

        o1(123);
        assert.strictEqual(o1(), 123);
        o1.restore();
        assert.strictEqual(o1(), 123); // o1 had no previous value
        o1(666);
        assert.strictEqual(o1(), 666);
        o1.restore();
        assert.strictEqual(o1(), 123);

        o2(999);
        assert.strictEqual(o2(), 999);
        o2.restore();
        assert.strictEqual(o2(), 5);
        o2.restore();
        assert.strictEqual(o2(), 999);
    });

    it('adds an `updatedBy` method to the subscribable prototype', function(done) {
        var timer,
            registerAsyncUpdater = function(obs) {
                timer = setInterval(function() {
                    obs(obs()+1);
                }, 10);
            },
            o = ko.observable(1).updatedBy(function(obs) {
                registerAsyncUpdater(obs);
            });

        setTimeout(function() {
            clearInterval(timer);
            assert.closeTo(o(), 20, 10);
            done();
        }, 200);
    });
});

