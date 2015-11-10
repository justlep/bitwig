/**
 * Represents a set of Control objects, e.g. one row of Fader objects.
 * @param name (String)
 * @param numberOfControls (Number) number of Control objects to generate
 * @param controlCreationFn (function) function creating a control,  e.g. function(index){...; return new BaseControl(..);}
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ControlSet = function(name, numberOfControls, controlCreationFn) {
    lep.util.assertString(name, 'Invalid name for ControlSet');
    lep.util.assert(!lep.ControlSet.instancesByName[name], 'ControlSet with name '+ name +' already exists');
    lep.util.assertNumberInRange(numberOfControls, 1, 32, 'Invalid numberOfControls for ControlSet.createAndAddControls');
    lep.util.assertFunction(controlCreationFn, 'Invalid controlCreationFn for ControlSet');

    var self = this,
        _valueSet = ko.observable(),
        _valuePage = ko.observable(0),
        _muted = ko.observable(false);

    this.id = lep.util.nextId();
    this.name = name;
    this.controls = [];

    for (var controlIndex = 0, control; controlIndex < numberOfControls; controlIndex++) {
        control = controlCreationFn(controlIndex);
        lep.util.assertBaseControl(control, 'controlCreationFn created invalid Control for createAndAddControls');
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
            if (newValueSet === _valueSet()) return;

            if (!newValueSet) {
                if (_valueSet()) {
                    lep.ControlSet.instanceByValueSetId[_valueSet().id] = null;
                }
                for (var i = 0; i < self.controls.length; i++) {
                    self.controls[i].detachValue();
                }
                _valueSet(null);
                // self.valuePage(0);
                return;
            }

            lep.ControlSet.instanceByValueSetId[newValueSet.id] = self;
            _valueSet(newValueSet);
            self.recallSelectedPage();
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
        return (!_valueSet()) ? 0 : (self.hasParamsValueSet()) ? _valueSet().lastPage() :
            Math.max(0, Math.ceil(_valueSet().values.length / numberOfControls) - 1);
    });
    this.hasPrevValuePage = ko.computed(function() {
        return !!self.valuePage();
    });
    this.hasNextValuePage = ko.computed(function() {
        return self.valuePage() < self.lastValuePage();
    });
    this.nextValuePage = function() {
        if (self.hasNextValuePage()) {
            self.valuePage(self.valuePage()+1);
            lep.logDebug('Switch to next page {} of {}', self.valuePage(), self.name);
        }
    };
    this.prevValuePage = function() {
        if (self.hasPrevValuePage()) {
            self.valuePage(self.valuePage()-1);
            lep.logDebug('Switch to previous page {} of {}', self.valuePage(), self.name);
        }
    };

    ko.computed(function() {
        if (!_valueSet()) return;
        var valueOffset = self.hasParamsValueSet() ? _valueSet().currentPageValueOffset() : (self.valuePage() * numberOfControls);
        lep.logDebug('new value offset: {}', valueOffset);
        for (var i = 0, value, control; i < numberOfControls; i++) {
            value = _valueSet().values[valueOffset + i];
            control = self.controls[i];
            if (value) {
                control.attachValue(value);
            } else {
                control.detachValue();
            }
        }
    });

    lep.ControlSet.instancesByName[this.name] = this;
};

/** @static */
lep.ControlSet.instancesByName = {};

/** @static */
lep.ControlSet.instanceByValueSetId = {};

/** @static */
lep.ControlSet.lastSelectedPageByValueSetId = {};

lep.ControlSet.prototype = {
    /**
     * Saves the currently selected page number of the current valueSet for later recall.
     */
    saveSelectedPage: function() {
        if (this.valueSet()) {
            lep.ControlSet.lastSelectedPageByValueSetId[this.valueSet().id] = this.valuePage();
        }
    },
    /**
     * Restores the page number last saved for the current valueSet.
     */
    recallSelectedPage: function() {
        this.valuePage(lep.ControlSet.lastSelectedPageByValueSetId[this.valueSet().id] || 0);
    },
    /**
     * Removes any values and/or valueSets attached to this ControlSets and its controls.
     * @param [optionalResetValueToSend] (Number) optional value to send to the device to indicate OFF sttus (mostly 0)
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

    setValueSet: function(newValueSet) {
        lep.util.assertValueSet(newValueSet, 'invalid ValueSet for ControlSet.attachValueSet');
        if (newValueSet === this.valueSet()) return;

        var oldControlSet = lep.ControlSet.instanceByValueSetId[newValueSet.id];
        if (oldControlSet) {
            oldControlSet.reset();
        }
        this.reset();
        lep.logDebug('Assigning {} to {}', newValueSet.name, this.name);
        this.valueSet(newValueSet);
    }
};