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
        _valueSet = ko.observable(),
        _valuePage = ko.observable(0),
        _muted = ko.observable(false);

    this.id = lep.util.nextId();
    this.name = name;
    this.controls = [];

    for (var controlIndex = 0, control; controlIndex < numberOfControls; controlIndex++) {
        control = controlCreationFn(controlIndex);
        lep.util.assertBaseControl(control, 'controlCreationFn returned invalid BaseControl {} for ControlSet {}', control, name);
        this.controls.push(control);
    }

    this.muted = ko.computed({
        read: _muted,
        write: function(isMuted) {
            for (var i = 0; i < self.controls.length; i++) {
                self.controls[i].setMuted(isMuted);
            }
            _muted(isMuted);
        }
    });

    this.toggleMuted = function() {
        self.muted(!self.muted());
    };

    this.valueSet = ko.computed({
        read: _valueSet,
        write: function(newValueSet) {
            var currentValueSet = _valueSet();
            if (currentValueSet === newValueSet) {
                return;
            }

            // detach own current ValueSet if present..
            if (currentValueSet) {
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

            lep.util.assertValueSet(newValueSet, 'Invalid newValueSet "{}" for attachValueSet on ControlSet {}', newValueSet, self.name);
            lep.util.assert(!(newValueSet instanceof lep.ParamsValueSet && self.controls.length !== 8),
                'ParamsValueSet {} requires a ControlSet of size 8, actual size is {}', newValueSet.name, self.controls.length);

            var oldControlSet = newValueSet.controlSet();
            if (oldControlSet) {
                oldControlSet.reset();
            }
            newValueSet.controlSet(self);
            _valueSet(newValueSet);
        }
    });

    this.hasParamsValueSet = ko.computed(function() {
        var isParamsValueSet = _valueSet() instanceof lep.ParamsValueSet;
        if (isParamsValueSet) {
            _valuePage(_valueSet().currentPage());
        }
        return isParamsValueSet;
    });

    this.valuePage = ko.computed({
        read: _valuePage,
        write: function(newValuePage) {
            if (self.hasParamsValueSet()) {
                /**
                 * If we have a ParamsValueSet, the new page must NOT be set directly via _valuePage(..), but indirectly
                 * over {@link ParamsValueSet.currentPage}.
                 * ParamsValueSet.currentPage(..) will set its actual currentPage to a consolidated value (i.e. taking into account
                 * the actual number of custom param pages).
                 * Finally, a change in ParamValueSet.currentPage triggers the {@link ControlSet.hasParamsValueSet}-computed,
                 * which will then update {@link _valuePage} to the consolidated value.
                 */
                _valueSet().currentPage(newValuePage);
            } else {
                var newPageEffective = Math.max(0, Math.min(self.lastValuePage(), newValuePage));
                _valuePage(newPageEffective);
            }
            self.saveSelectedPage();
        }
    });

    this.lastValuePage = ko.computed(function() {
        var valueSet = _valueSet();

        return valueSet ? (
                self.hasParamsValueSet() ? valueSet.lastPage() : Math.max(0, Math.ceil(valueSet.values.length / numberOfControls) - 1)
            ) : 0;
    });

    this.hasPrevValuePage = ko.computed(function() {
        return !!self.valuePage();
    });

    this.hasNextValuePage = ko.computed(function() {
        return self.valuePage() < self.lastValuePage();
    });

    this.nextValuePage = function() {
        if (self.hasNextValuePage()) {
            lep.logDebug('Switching to next page {} of {}', self.valuePage(), self.name);
            self.valuePage(self.valuePage() + 1);
        }
    };

    this.prevValuePage = function() {
        if (self.hasPrevValuePage()) {
            lep.logDebug('Switching to previous page {} of {}', self.valuePage(), self.name);
            self.valuePage(self.valuePage() - 1);
        }
    };

    ko.computed(function() {
        var valueSet = _valueSet();
        if (!valueSet) {
            return;
        }

        var valueOffset = self.hasParamsValueSet() ? 0 : (self.valuePage() * numberOfControls),
            dynamicId = valueSet && valueSet.dynamicId();

        if (dynamicId) {
            // (!) Do not make the self.recallSelectedPage(); synchronous.
            //     Deferred calling is important for not building
            host.scheduleTask(function(){
                self.recallSelectedPage();
            }, 1);
        }

        lep.logDebug('new value offset: {}', valueOffset);
        for (var i = 0, value, allValues = valueSet.values, allControls = self.controls; i < numberOfControls; i++) {
            value = allValues[valueOffset + i];
            if (value) {
                allControls[i].attachValue(value);
            } else {
                allControls[i].detachValue();
            }
        }
    });

    lep.ControlSet.instancesByName[this.name] = this;
};

/** @type {Object.<string,lep.ControlSet>} */
lep.ControlSet.instancesByName = {};

/** @type {Object.<number,number>} */
lep.ControlSet.lastSelectedPageByValueSetId = {};

lep.ControlSet.prototype = {
    /**
     * Saves the currently selected page number of the current valueSet for later recall.
     */
    saveSelectedPage: function() {
        var valueSet = this.valueSet();
        if (valueSet) {
            lep.ControlSet.lastSelectedPageByValueSetId[valueSet.dynamicId()] = this.valuePage();
        }
    },
    /**
     * Restores the page number last saved for the current valueSet.
     */
    recallSelectedPage: function() {
        var dynamicId = this.valueSet().dynamicId(),
            page = lep.ControlSet.lastSelectedPageByValueSetId[dynamicId] || 0;
        lep.logDebug('Recalling selected page {} for {}', page, dynamicId);
        this.valuePage(page);
    },
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
     * @param {lep.ValueSet} newValueSet
     */
    setValueSet: function(newValueSet) {
        lep.util.assertValueSet(newValueSet, 'Invalid newValueSet "{}" for attachValueSet on ControlSet {}', newValueSet, this.name);
        if (newValueSet === this.valueSet()) return;
        lep.logDebug('Attaching ValueSet {} -> {} ...', newValueSet.name, this.name);
        this.valueSet(newValueSet);
    },

    setObservableValueSet: function(obs) {
        lep.util.assert(!this._isFollingObservable, 'ControlSet.setObservableValueSet already called for {}', this.name);
        lep.util.assertObservable(obs, 'Invalid observable for ControlSet.setObservableValueSet. {}', this.name);
        this._isFollingObservable = true;
        obs.subscribe(this.setValueSet, this);
        this.setValueSet(obs());
    }
};

/**
 * @callback controlCreationFn
 * @param {number} controlIndex
 * @return {lep.BaseControl}
 */