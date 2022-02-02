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
        masterTrackInstancesBySceneSize = null,
        playingObservable = null,
        /**
         * Throws an error;
         * To be called from within one of the static assert* methods.
         * @param {Object} assertionArgs - the original arguments from the assert*-call
         * @param {number} [optionalMessageOffset] - optional offset of the actual error message within the assertionArgs (default: 1)
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
        /**
         * @return {number} a positive number
         */
        nextId: function() {
            return ++idsCounter;
        },

        /**
         * @param {number} [optScenes=0]
         * @return {MasterTrack|*}
         */
        getMasterTrack: function(optScenes) {
            if (!masterTrackInstancesBySceneSize) {
                masterTrackInstancesBySceneSize = {};
            }
            var scenes = optScenes || 0,
                instance = masterTrackInstancesBySceneSize[scenes];

            if (!instance) {
                instance = host.createMasterTrack(scenes);
                masterTrackInstancesBySceneSize[scenes] = instance;
            }
            return instance;
        },
        /**
         * @return {Transport} single, reused instance of Bitwig's transport object
         */
        getTransport: function() {
            if (!transportInstance) {
                transportInstance = host.createTransport();
            }
            return transportInstance;
        },
        /**
         * @return {ko.observable} a boolean knockout observable telling if Bitwig is currently playing
         */
        getTransportIsPlayingObservable: function() {
            if (!playingObservable) {
                playingObservable = ko.computed( ko.observable(false).updatedByBitwigValue( this.getTransport().isPlaying() ) );
            }
            return playingObservable;
        },
        /**
         * Returns a given String with placeholders replaced.
         * Contained placeholders '{}' will be replaced with additional parameters in the respective order.
         * @param {*} s -  what to print
         * @param {...*} - any number of additional values replacing the placeholders in s
         * @return {string}
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
        assertObjectProxy: function(expr) {
            (expr && typeof expr.createEqualsValue === 'function') || throwError(arguments);
        },
        /**
         * Return a given number restricted to a min+max value.
         */
        limitToRange: function(val, min, max) {
            return Math.max(min, Math.min(val, max));
        },
        /**
         * Binds a method to a given context.
         * @param {Function} fn - the function to bind
         * @param {Object} context - this-context to preserve for invocations
         */
        bind: function(fn, context) {
            return function() {
                return fn.apply(context, arguments);
            };
        },
        /**
         * Memorizes the current time under a given id.
         * A subsequent call of {@link #stopTimer} will then return the time difference in millis.
         * @param {number} id - some id
         */
        startTimer: function(id) {
            this.assertNumber(id, 'invalid id for lep.util.startTime: ', id);
            startTimesById[id] = Date.now();
        },
        /**
         * Returns the time in milliseconds that passed between now and the last call of {@link #startTimer} for a given id.
         * @param {number} id - some id
         * @param {boolean} [resetAfter] - if true, the start time value is reset to 0, to subsequent calls return -1
         * @return (Number) time in millis; -1 if timerStart wasn't called for that id before
         */
        stopTimer: function(id, resetAfter) {
            var now = Date.now(),
                diff = now - (startTimesById[id] || (now + 1));
            if (resetAfter) {
                startTimesById[id] = 0;
            }
            return diff;
        },
        /**
         * Returns an array of the given size, filled with either a fixed value or a value generated by a given function
         * @param {number} size
         * @param {*} valueOrFn -  a fix value OR a function whose return-value is used, e.g. function(i){return i*i}
         * @return {Array}
         */
        generateArray: function(size, valueOrFn) {
            var arr = [], i = size;
            /*eslint curly:0 */
            if (typeof valueOrFn === 'function') {
                while (--i >= 0) arr[i] = valueOrFn(i);
            } else {
                while (--i >= 0) arr[i] = valueOrFn;
            }
            return arr;
        },
        /**
         * Returns a one-dimensional array based on cols and rows size, populated by a createFunction
         * @param {number} cols
         * @param {number} rows
         * @param {Function} creatorFn - e.g. function (colIndex, rowIndex, absoluteIndex){..}
         * @return {Array}
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
         * @param {...*} - any number of subsequent key, value, key, value, ...
         * @return {Object}
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
         * @param {Object} target
         * @param {...Object} - any number of objects whose properties to copy to target
         * @return {Object} the modified target
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
         * @param {function} superClass - constructor to be inherited from
         * @param {Object} proto - the derived class' prototype, incl. any number of properties and methods
         * @param {Function} proto._init - constructor of the new class (can call this._super(..) to invoke parent constructor)
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
        },

        /**
         * @param {ObjectProxy} proxy1
         * @param {ObjectProxy} proxy2
         * @return {function():boolean} - a function that returns true if the given two ObjectProxy (mostly CursorTrack/CursorDevice) are
         *                                referencing the same element, i.e. if they are in sync 
         */
        createCursorSyncCheckFn: function(proxy1, proxy2) {
            this.assertObjectProxy(proxy1);
            this.assertObjectProxy(proxy2);
            var val = proxy1.createEqualsValue(proxy2);
            return function() {
                return val.get();
            };
        }
    };

})();
