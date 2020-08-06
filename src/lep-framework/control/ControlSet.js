/**
 * Represents a set of {@link lep.BaseControl} objects (or derived), e.g. one row of Fader objects.
 *
 * @param {string} name
 * @param {number} numberOfControls - number of BaseControl objects to generate
 * @param {controlCreationFn} controlCreationFn - e.g. function(index){...; return new BaseControl(..);}
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.ControlSet = function(name, numberOfControls, controlCreationFn) {
    lep.util.assertString(name, 'Invalid name for ControlSet');
    lep.util.assert(!lep.ControlSet.instancesByName[name], 'ControlSet with name "{}" already exists', name);
    lep.util.assertNumberInRange(numberOfControls, 1, 64, 'Invalid numberOfControls {} for ControlSet {}', numberOfControls, name);
    lep.util.assertFunction(controlCreationFn, 'Invalid controlCreationFn for ControlSet {}', name);

    var self = this,
        _valueSet = ko.observable();

    this.id = lep.util.nextId();
    this.name = name;
    this.autoSwap = false;

    /** @type {lep.BaseControl[]} */
    this.controls = [];

    for (var controlIndex = 0, control; controlIndex < numberOfControls; controlIndex++) {
        control = controlCreationFn(controlIndex);
        lep.util.assertBaseControl(control, 'controlCreationFn returned invalid BaseControl {} for ControlSet {}', control, name);
        control.parentControlSet = this;
        this.controls.push(control);
    }

    this.valueSet = ko.computed({
        read: _valueSet,
        write: function(newValueSet) {
            var currentValueSet = _valueSet();
            if (currentValueSet === newValueSet) {
                return;
            }

            if (currentValueSet) {
                // detach own current ValueSet if present..
                for (var i = 0; i < self.controls.length; i++) {
                    self.controls[i].detachValue();
                }
                currentValueSet.controlSet(null);
            }

            if (!newValueSet) {
                _valueSet(null);
                return;
            }

            // From here we're supposed to assign a new ValueSet..

            lep.util.assertValueSet(newValueSet, 'Invalid newValueSet "{}" for ControlSet {}', newValueSet, self.name);
            lep.util.assert(newValueSet.supportsControlSet(self), 'ValueSet "{}" incompatible to ControlSet {}', newValueSet.name, self.name);

            var oldControlSet = newValueSet.controlSet();
            if (oldControlSet) {
                oldControlSet.reset();
            }
            newValueSet.controlSet(self);
            _valueSet(newValueSet);

            if (self.autoSwap && oldControlSet && currentValueSet) {
                oldControlSet.valueSet(currentValueSet);
            }
        }
    });

    var _flushDispatcher = lep.MidiFlushDispatcher.getInstance();

    ko.computed(function() {
        var valueSet = self.valueSet();
        if (valueSet) {
            _flushDispatcher.enqueueUdpNameChange(self.name, valueSet.name);
        }
        return valueSet ? valueSet.currentValues() : null;
    }).subscribe(function(newCurrentValues) {
        for (var i = (newCurrentValues||'').length - 1 ; i>= 0; i--) {
            self.controls[i].attachValue(newCurrentValues[i]);
        }
    });

    this.valuePage = ko.computed({
        read: ko.computed(function() {
            var valueSet = _valueSet();
            return valueSet ? valueSet.currentPage() : -1;
        }),
        write: function(newValuePage) {
            var valueSet = _valueSet();
            if (valueSet) {
                valueSet.currentPage(newValuePage);
            }
        }
    });

    this.hasPrevValuePage = ko.computed(function() {
        var valueSet = _valueSet() || false;
        return valueSet && valueSet.hasPrevPage();
    });

    this.hasNextValuePage = ko.computed(function() {
        var valueSet = _valueSet() || false;
        return valueSet && valueSet.hasNextPage();
    });

    this.nextValuePage = function() {
        var valueSet = _valueSet();
        if (valueSet) {
            valueSet.gotoNextPage();
        }
    };

    this.prevValuePage = function() {
        var valueSet = _valueSet();
        if (valueSet) {
            valueSet.gotoPrevPage();
        }
    };

    this.muted = ko.observable(false).withSubscription(function(newIsMuted) {
        for (var i = 0; i < self.controls.length; i++) {
            this.controls[i].setMuted(newIsMuted);
        }
    }, this).extend({toggleable:true});

    lep.ControlSet.instancesByName[this.name] = this;
};

/** @type {Object.<string,lep.ControlSet>} */
lep.ControlSet.instancesByName = {};

lep.ControlSet.prototype = {
    /**
     * Removes any values and/or valueSets attached to this ControlSets and its controls.
     * @param {number} [optionalResetValueToSend] - optional value to send to the device to indicate OFF sttus (mostly 0)
     *                                            (!) Will be sent only if there was a valueSet attached before reset.
     */
    reset: function(optionalResetValueToSend) {
        lep.logDebug('Resetting {}', this.name);
        if (this.valueSet()) {
            this.valueSet(null);
        }
        if (arguments.length) {
            lep.util.assertNumberInRange(optionalResetValueToSend, 0, 127, 'Invalid optionalResetValueToSend for {}', this.name);
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].syncToMidi(optionalResetValueToSend);
            }
        }
    },
    /**
     * TODO unused, replace usages with direct usage of this.valueSet(..)
     * @param {lep.ValueSet} newValueSet
     */
    setValueSet: function(newValueSet) {
        lep.util.assertValueSet(newValueSet, 'Invalid newValueSet "{}" for attachValueSet on ControlSet {}', newValueSet, this.name);
        if (newValueSet !== this.valueSet()) {
            this.valueSet(newValueSet);
        }
    },
    /**
     * Can be called ONCE only
     * @param {ko.observable} obs
     */
    setObservableValueSet: function(obs) {
        lep.util.assert(!this._isFollingObservable, 'ControlSet.setObservableValueSet already called for {}', this.name);
        lep.util.assertObservable(obs, 'Invalid observable for ControlSet.setObservableValueSet. {}', this.name);
        this._isFollingObservable = true;
        obs.subscribe(this.valueSet, this);
        this.setValueSet(obs());
    },

    /**
     * @param {boolean} [autoSwap=true] - if omitted or not false, then
     *                                    when this instance gets a new ValueSet which is currently attached to another ControlSet,
     *                                    that other ControlSet will afterwards get this instance's current(previous) ValueSet,
     *                                    i.e. they're swapping ValueSets.
     *
     * @return {lep.ControlSet} - this instance
     */
    withAutoSwap: function(autoSwap) {
        this.autoSwap = autoSwap !== false;
        return this;
    },
    forceSyncToMidi: function() {
        for (var i = 0, len = this.controls.length; i < len; i++) {
            this.controls[i].forceSyncToMidi();
        }
    }
};

/**
 * @callback controlCreationFn
 * @param {number} controlIndex
 * @return {lep.BaseControl}
 */
