
/**
 * @param {Value} bitwigValue
 * @return {ko.subscribable}
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
 * An extender allowing to restore the previous value of a writeable observable after it was changed.
 * Adds to the observable:
 *   - {Function} restore()
 *   - {*} previousValue
 */
ko.extenders.restoreable = (function() {
    const DESCRIPTOR = {
        enumerable: false,
        configurable: false,
        get: function() {
            return this.__rst_previousValue__;
        }
    };

    return function(target /*, opts */) {
        lep.util.assert(ko.isWriteableObservable(target), 'Cannot use toggleable extender on readonly observables');

        target.subscribe(function(oldValue) {
            target.__rst_previousValue__ = oldValue;
        }, null, 'beforeChange');

        Object.defineProperty(target, 'previousValue', DESCRIPTOR);

        target.restore = function() {
            if (target.__rst_previousValue__ !== undefined) {
                target(target.__rst_previousValue__);
            }
        };
        return target;
    };
})();