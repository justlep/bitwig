/*global describe, it, beforeEach */

var assert = require('chai').assert;

// load lep-API and mocks into this context..
require('./../loadFrameworkAndMocks');

describe('lep.util.extendClass()', function() {

    var A, B, C, a, b;

    beforeEach(function(){
        A = function(a) {
            this.a = a;
        };
        A.prototype.getA = function() {
            return this.a;
        };
        B = lep.util.extendClass(A, {
            _init: function(a,b) {
                this._super(a);
                this.b = b;
            },
            getB: function() {
                return this.b;
            }
        });
        a = new A(111);
        b = new B(222,333);
    });

    it('can extend classes', function() {
        assert.strictEqual(a.a, 111);
        assert.strictEqual(a.getA(), 111);
        assert.strictEqual(b.a, 222);
        assert.strictEqual(b.getA(), 222);
        assert.strictEqual(b.b, 333);
        assert.strictEqual(b.getB(), 333);
    });

    it('supports instanceof operator', function() {
        assert.instanceOf(a, A);
        assert.instanceOf(b, A);
        assert.instanceOf(b, B);
    });
    
    it('does not allow deep prototype chains ', function() {
        assert.throw(function() {
            C = lep.util.extendClass(B, {
                _init: function(c) {
                    this._super(a,b);
                    this.c = c;
                }
            });
        });
    });
});
