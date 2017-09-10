/**
 * Some useful static helpers..
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var lep = (typeof lep !== 'undefined') ? lep : {};

/*jshint -W030 */
lep.util = (function() {

    var idsCounter = 0,
        transportInstance = null,
        /**
         * Throws an error;
         * To be called from within one of the static assert* methods.
         * @param assertionArgs (Arguments) the original arguments from the assert*-call
         * @param [optionalMessageOffset] (Number) optional offset of the actual error message within the assertionArgs (default: 1)
         */
        throwError = function(assertionArgs, optionalMessageOffset) {
            var messageOffset = optionalMessageOffset || 1,
                messageAndArgumentsArray = Array.prototype.slice.call(assertionArgs, messageOffset),
                emptySafeMessageAndArgsArray = (messageAndArgumentsArray.length) ? messageAndArgumentsArray : ['Assertion failed'];

            throw new Error(lep.util.formatString.apply(null, emptySafeMessageAndArgsArray));
        },
        startTimesById = [];

    return {
        NOP: function(){},
        nextId: function() {
            return ++idsCounter;
        },

        /**
         * @return (Transport) single, reused instance of Bitwig's transport object
         */
        getTransport: function() {
            if (!transportInstance) {
                transportInstance = host.createTransport();
            }
            return transportInstance;
        },
        /**
         * Returns a given String with placeholders replaced.
         * Contained placeholders '{}' will be replaced with additional parameters in the respective order.
         * @param s (mixed) what to print
         * @params (mixed*) (optional) any number of values replacing the placeholders in s
         */
        formatString: function(s) {
            var out = '' + s;
            for (var i = 1, len = arguments.length; i < len; ++i) {
                out = out.replace('{}', arguments[i]);
            }
            return out;
        },
        assert: function(expr) {
            expr || throwError(arguments);
        },
        assertDefined: function(expr) {
            (typeof expr !== 'undefined') || throwError(arguments);
        },
        assertObservable: function(expr) {
            (ko.isObservable(expr)) || throwError(arguments);
        },
        assertBoolean: function(expr) {
            (typeof expr === 'boolean') || throwError(arguments);
        },
        assertString: function(expr) {
            (typeof expr === 'string') || throwError(arguments);
        },
        assertNonEmptyString: function(expr) {
            (!!expr && (typeof expr === 'string')) || throwError(arguments);
        },
        assertStringOrEmpty: function(expr) {
            (!expr || typeof expr === 'string') || throwError(arguments);
        },
        assertNumber: function(expr) {
            (typeof expr === 'number') || throwError(arguments);
        },
        assertNumberInRange: function(expr, min, max) {
            (typeof expr === 'number' && expr >= min && expr <= max) || throwError(arguments, 3);
        },
        assertNumberInRangeOrEmpty: function(expr, min, max) {
            (!expr || (typeof expr === 'number' && expr >= min && expr <= max)) || throwError(arguments, 3);
        },
        assertFunction: function(expr) {
            (typeof expr === 'function') || throwError(arguments);
        },
        assertFunctionOrEmpty: function(expr) {
            (!expr || (typeof expr === 'function')) || throwError(arguments);
        },
        assertObject: function(expr) {
            (expr && typeof expr === 'object') || throwError(arguments);
        },
        assertObjectOrEmpty: function(expr) {
            (!expr || (typeof expr === 'object')) || throwError(arguments);
        },
        assertArray: function(expr) {
            (expr && expr instanceof Array) || throwError(arguments);
        },
        assertBaseValue: function(expr) {
            (expr && expr instanceof lep.BaseValue) || throwError(arguments);
        },
        assertBaseControl: function(expr) {
            (expr && expr instanceof lep.BaseControl) || throwError(arguments);
        },
        assertControlSet: function(expr) {
            (expr && expr instanceof lep.ControlSet) || throwError(arguments);
        },
        assertValueSet: function(expr) {
            (expr && expr instanceof lep.ValueSet) || throwError(arguments);
        },
        /**
         * Return a given number restricted to a min+max value.
         */
        limitToRange: function(val, min, max) {
            return Math.max(min, Math.min(val, max));
        },
        /**
         * Binds a method to a given context.
         * @param fn (function)
         * @param context (Object) this-context to preserve for invocations
         */
        bind: function(fn, context) {
            return function() {
                return fn.apply(context, arguments);
            };
        },
        /**
         * Memorizes the current time under a given id.
         * A subsequent call of {@link #stopTimer} will then return the time difference in millis.
         * @param id (Number) some id
         */
        startTimer: function(id) {
            this.assertNumber(id, 'invalid id for lep.util.startTime: ', id);
            startTimesById[id] = Date.now();
        },
        /**
         * Returns the time in milliseconds that passed between now and the last call of {@link #startTimer} for a given id.
         * @param id (Number) some id
         * @return (Number) time in millis; -1 if timerStart wasn't called for that id before
         */
        stopTimer: function(id) {
            var now = Date.now();
            return now - (startTimesById[id] || (now + 1));
        },
        /**
         * Returns an array of the given size, filled with either a fixed value or a value generated by a given function
         * @param size
         * @param valueOrFn {*} a fix value OR a function whose return-value is used, e.g. function(i){return i*i}
         * @returns {Array}
         */
        generateArray: function(size, valueOrFn) {
            var arr = [], i = size;
            if (typeof valueOrFn === 'function') {
                while (--i >= 0) arr[i] = valueOrFn(i);
            } else {
                while (--i >= 0) arr[i] = valueOrFn;
            }
            return arr;
        },
        /**
         * Returns a one-dimensional array based on cols and rows size, populated by a createFunction
         * @param cols {Number}
         * @param rows {Number}
         * @param creatorFn {function} e.g. function (colIndex, rowIndex, absoluteIndex){..}
         * @returns {Array}
         */
        generateArrayTableBased: function(cols, rows, creatorFn) {
            var arr = [], index = 0;
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    arr[index] = creatorFn(col, row, index);
                    index++;
                }
            }
            return arr;
        },
        /**
         * Creates a map using two consecutive arguments as key, value
         */
        createMap: function(/* key, value, key, value ...*/) {
            var argsLen = arguments.length,
                map = {};
            for (var i = 1; i < argsLen; i += 2) {
                map[''+arguments[i-1]] = arguments[i];
            }
            return map;
        },
        /**
         * Extends a given object with one or more others.
         * @param target (Object)
         * @params any number of objects whose properties to copy to target
         * @returns (Object) the modified target
         */
        extend: function(target /*, ...sources */) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                var src = arguments[i] || {};
                for (var k in src) {
                    if (src.hasOwnProperty(k)) {
                        target[k] = src[k];
                    }
                }
            }
            return target;
        },
        /**
         * Returns a new class (constructor) by prototype-inheritance from a given one.
         * As lengthy prototype chains may have performance impacts, this implementation only supports ONE level of inheritance,
         * throwing an error if tried otherwise.
         * @param superClass (function) constructor to be inherited from
         * @param proto (object) the derived class' prototype
         *            - _init (function) constructor of the new class (can call this._super(..) to invoke parent constructor)
         *            - any number of properties and methods
         */
        extendClass: function(superClass, proto) {
            this.assertFunction(superClass, 'Expected a constructor function for lep.util.extendClass superClass');
            this.assert(!superClass.prototype || !superClass.prototype._super, 'util.extendClass does not support long prototype chains');

            var Fn = function(){};
            Fn.prototype = superClass.prototype;

            var newConstructorFn = proto._init,
                newClass = function() {
                    newConstructorFn.apply(this, arguments);
                },
                newPrototype = this.extend(new Fn(), proto);

            delete newPrototype._init;
            newPrototype._super = function() {
                superClass.apply(this, arguments);
            };
            newClass.prototype = newPrototype;
            return newClass;
        }
    };
})();