
/**
 * @param bitwigValue {Value}
 * @returns {ko.subscribable}
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
 * @param updaterFunction {function} the function that gets this observable as first parameter, so it can update it
 * @returns {ko.subscribable}
 */
ko.subscribable.fn.updatedBy = function(updaterFunction) {
    lep.util.assertFunction(updaterFunction, 'Invalid bitwigValue.updatedBy, {}', updaterFunction);
    updaterFunction(this);
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
 * @param target {ko.observable}
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