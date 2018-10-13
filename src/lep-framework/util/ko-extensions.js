
/**
 * @param {Value} bitwigValue
 * @return {ko.writableObservable}
 */
ko.subscribable.fn.updatedByBitwigValue = function(bitwigValue) {
    lep.util.assertFunction(bitwigValue && bitwigValue.addValueObserver, 'Invalid bitwigValue.addValueObserver, {}', bitwigValue);
    lep.util.assertFunction(bitwigValue && bitwigValue.markInterested, 'Invalid bitwigValue.markInterested, {}', bitwigValue);

    bitwigValue.addValueObserver(this);
    bitwigValue.markInterested();
    // TODO maybe add subscription management later

    return this;
};

/**
 * @param {function} updaterFunction - the function that gets this observable as first parameter, so it can update it
 * @return {ko.subscribable}
 */
ko.subscribable.fn.updatedBy = function(updaterFunction) {
    lep.util.assertFunction(updaterFunction, 'Invalid updaterFunction for ko-extension updatedBy, {}', updaterFunction);
    updaterFunction(this);
    return this;
};

/**
 * @param {Function} subscriberFn, e.g. function(newVal){..}
 * @param {?Object} [ctx] - optional this-content for execution
 * @return {ko.subscribable}
 */
ko.subscribable.fn.withSubscription = function(subscriberFn, ctx) {
    lep.util.assertFunction(subscriberFn, 'Invalid subscriberFn for ko-extension withSubscription, {}', subscriberFn);
    this.subscribe(subscriberFn, ctx || null);
    return this;
};

/**
 * Adds a .toggle() method to all Knockout subscribables. (!) NOT context-safe.
 */
ko.subscribable.fn.toggle = function() {
    this(!this());
};

/**
 * An extender adding context-safe .toggle(), .toggleOn() and toggleOff() methods to the extended observable.
 * @param {ko.observable} target -
 */
ko.extenders.toggleable = function(target /*, opts */) {
    lep.util.assert(ko.isWriteableObservable(target), 'Cannot use toggleable extender on readonly observables');

    target.toggleOn = function() {
        target(true);
    };
    target.toggleOff = function() {
        target(false);
    };
    target.toggle = function() {
        target(!target());
    };

    return target;
};

/**
 * Shorthand for {@code ko.observable(val).extend({toggleable:true})}
 * @param {*} val - the observable's initial value
 * @return {ko.observable} - an observable extended by the `toggleable` extender
 */
ko.toggleableObservable = function(val) {
    return ko.observable(val).extend({toggleable: true});
};

/**
 * An extender allowing to restore the previous value of a writeable observable after it was changed.
 * Adds to the observable:
 *   - {Function} restore()
 *   - {*} previousValue
 */
ko.extenders.restoreable = (function() {
    /*eslint:camelcase:0 */

    var OLD_VAL_KEY = '__rst_previousValue__',
        DESCRIPTOR = {
            enumerable: false,
            configurable: false,
            get: function() {
                return this[OLD_VAL_KEY];
            }
        };

    return function(target /*, opts */) {
        lep.util.assert(ko.isWriteableObservable(target), 'Cannot use toggleable extender on readonly observables');

        target.subscribe(function(oldValue) {
            target[OLD_VAL_KEY] = oldValue;
        }, null, 'beforeChange');

        Object.defineProperty(target, 'previousValue', DESCRIPTOR);

        target.restore = function() {
            if (target[OLD_VAL_KEY] !== undefined) {
                target(target[OLD_VAL_KEY]);
            }
        };
        return target;
    };
})();