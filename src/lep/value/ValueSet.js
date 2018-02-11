/**
 * Represents a set of BaseValue (or subclass) objects
 * which can be attached to an instance of {@link lep.ControlSet}.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {string} name
 * @param {number} cols - the number of Values to create per row
 * @param {number} rows - the number of rows to generate values for
 * @param {valueCreationFn} valueCreationFn - e.g. function(colIndex, rowIndex, totalIndex){.. return new lep.BaseValue(..);}
 * @param {number} [windowSize] - optionally the size of concurrent values provided by {@link lep.ValueSet.currentValues}.
 *                                By default, the value from {@param cols} is used. Useful when the values are created
 *                                col/row-wise but *all* values are always used concurrently, e.g. on a button matrix.
 * @constructor
 */
lep.ValueSet = function(name, cols, rows, valueCreationFn, windowSize) {
    lep.util.assertString(name, 'Invalid name for ValueSet');
    lep.ValueSet.register(name, this);
    lep.util.assertNumber(rows, 'Invalids rows for ValueSet: {}', rows);
    lep.util.assertNumber(cols, 'Invalid cols for ValueSet: {}', cols);
    lep.util.assertNumberInRange(rows * cols, 1, lep.ValueSet.MAX_SIZE, 'Invalid size for ValueSet (actual: {}, max: {})',
                                 rows * cols, lep.ValueSet.MAX_SIZE);
    lep.util.assertFunction(valueCreationFn, 'Invalid valueCreationFn for ValueSet');
    lep.util.assert(typeof windowSize === 'undefined' || windowSize === cols || windowSize === (cols*rows), '' +
        'Invalid windowSize "{}" for ValueSet {}', windowSize, name);

    /**
     * The total number of {@link lep.BaseValue} instances this ValueSet is using internally.
     * @type {number}
     * @const
     * @private
     */
    this._totalStaticValues = cols * rows;
    /**
     * The fix number of values this ValueSet provides to a ControlSet by {@link lep.ValueSet.currentValues}
     * @type {number}
     * @const
     * @private
     */
    this._windowSize = windowSize || cols;

    var self = this;

    this.id = lep.util.nextId();
    this.name = name;

    /** @type {lep.BaseValue} */
    this.values = []; // BaseValues, NOT numerical values

    lep.logDebug("Creating values for ValueSet {}", this.name);
    for (var rowIndex = 0, totalIndex = 0, colIndex, value; rowIndex < rows; rowIndex++) {
        for (colIndex = 0; colIndex < cols; colIndex++, totalIndex++) {
            value = valueCreationFn(colIndex, rowIndex, totalIndex);
            lep.util.assertBaseValue(value, 'Invalid value returned by valueCreationFn in ValueSet');
            lep.logDebug("Created value: {}", value.name, this.name);
            this.values.push(value);
        }
    }

    this.controlSet = ko.observable(null).withSubscription(function(newControlSet) {
        var message = newControlSet ? 'ValueSet {} now controlled by {}' : 'ValueSet {} is detached';
        lep.logDebug(message, this.name, newControlSet && newControlSet.name || '???');
    }, this);

    this.currentPage = ko.observable(0);
    this.lastPage = ko.observable(Math.ceil(this._totalStaticValues / this._windowSize) - 1);

    this.hasNextPage = ko.computed(function() {
        return self.currentPage() < self.lastPage();
    });

    this.hasPrevPage = ko.computed(function() {
        return self.currentPage() > 0;
    });

    this.currentValues = ko.computed(function() {
        var valsPerPage = self._windowSize;
        if (valsPerPage === self._totalStaticValues) {
            return self.values;
        }
        var offs = self.currentPage() * valsPerPage,
            vals = [];
        for (var i=offs, last = offs + valsPerPage - 1; i <= last; i++) {
            vals.push(self.values[i] || null);
        }
        return vals;
    });
};

/** @type {Object.<string,lep.ValueSet>} */
lep.ValueSet.instancesByName = {};

lep.ValueSet.exists = function(name) {
    return !!lep.ValueSet.instancesByName[name];
};

lep.ValueSet.register = function(name, instance) {
    lep.util.assert(!lep.ValueSet.exists(name), 'ValueSet with name "{}" already exists', name);
    lep.ValueSet.instancesByName[name] = instance;
};

/**
 * Creates a new ValueSet whose windowSize set to its entire size.
 * Same parameters as the ValueSet constructor.
 * @param {string} name
 * @param {number} cols
 * @param {number} rows
 * @param {valueCreationFn} valueCreationFn
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createForMatrix = function(name, cols, rows, valueCreationFn) {
    return new lep.ValueSet(name, cols, rows, valueCreationFn, cols*rows);
};

/** @static */
lep.ValueSet.MAX_SIZE = 100;

lep.ValueSet.prototype = {
    supportsControlSet: function(controlSet) {
        var controlSetSize = controlSet.controls.length;
        return controlSetSize === this._windowSize;
    },
    gotoNextPage: function() {
        if (this.hasNextPage()) {
            this.currentPage(this.currentPage() + 1);
        }
    },
    gotoPrevPage: function() {
        if (this.hasPrevPage()) {
            this.currentPage(this.currentPage() - 1);
        }
    }
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @param {Object} prefs
 * @param {boolean} prefs.soloExclusive
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createSoloValueSet = function(trackBank, windowSize, prefs) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSoloValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSoloValueSet', windowSize);
    lep.util.assertObject(prefs, 'Invalid prefs for ValueSet.createSoloValueSet');
    lep.util.assertBoolean(prefs.soloExclusive, 'Invalid prefs.soloExclusive for ValueSet.createSoloValueSet');

    return new lep.ValueSet('Solo', windowSize, 1, function(channelIndex) {
        return lep.ToggledValue.createSoloValue(trackBank, channelIndex, prefs);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createMuteValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createMuteValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createMuteValueSet', windowSize);

    return new lep.ValueSet('Mute', windowSize, 1, function(channelIndex) {
        return lep.ToggledValue.createMuteValue(trackBank, channelIndex);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createArmValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createArmValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createArmValueSet', windowSize);

    return new lep.ValueSet('Arm', windowSize, 1, function(channelIndex) {
        return lep.ToggledValue.createArmValue(trackBank, channelIndex);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createSelectValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSelectValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSelectValueSet', windowSize);

    return new lep.ValueSet('Select', windowSize, 1, function(channelIndex) {
        return lep.ChannelSelectValue.create(trackBank, channelIndex);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createVolumeValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createVolumeValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createVolumeValueSet', windowSize);

    return new lep.ValueSet('Volumes', windowSize, 1, function(channelIndex) {
        return lep.StandardRangedValue.createVolumeValue(trackBank, channelIndex);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} windowSize
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createPanValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createPanValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createPanValueSet', windowSize);

    return new lep.ValueSet('Pans', windowSize, 1, function(channelIndex) {
        return lep.StandardRangedValue.createPanValue(trackBank, channelIndex);
    });
};

/**
 * @param {ChannelBank} trackBank
 * @param {number} numberOfSends
 * @param {number} windowSize
 * @param {boolean} [allowSecondInstance]
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createSendsValueSet = function(trackBank, numberOfSends, windowSize, allowSecondInstance) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSendsValueSet');
    lep.util.assertNumberInRange(numberOfSends, 1, 20, 'Invalid numberOfSends {} for ValueSet.createSendsValueSet', numberOfSends);
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSendsValueSet', windowSize);

    var firstInstanceExists = lep.ValueSet.exists('Sends'),
        name = firstInstanceExists  ? 'Sends2' : 'Sends';

    lep.util.assert(!firstInstanceExists || allowSecondInstance, 'Use allowSecondInstance to allow multiple Send ValueSets');
    return new lep.ValueSet(name, windowSize, numberOfSends, function(channelIndex, sendIndex) {
        return lep.StandardRangedValue.createSendValue(trackBank, channelIndex, sendIndex);
    });
};

/**
 * @param {number} numberOfPages
 * @param {number} userControlsPerPage
 * @param {string} labelPattern - label with TWO '{}' placeholders for (1) the 1-based page, (2) the 1-based index within the page
 *                               i.e. a given labelPattern 'UC-{}-{}' will result in UserControls with labels
 *                                 "UC-1-1" to "UC-<numberOfPages>-<userControlsPerPage>"
 * @return {lep.ValueSet}
 * @static
 */
lep.ValueSet.createUserControlsValueSet = function(numberOfPages, userControlsPerPage, labelPattern) {
    lep.util.assertNumberInRange(numberOfPages, 1, 20, 'Invalid numberOfPages {} for ValueSet.createUserControlsValueSet', numberOfPages);
    lep.util.assertNumberInRange(userControlsPerPage, 1, 20, 'Invalid userControlsPerPage {} for ValueSet.createUserControlsValueSet',
                                                             userControlsPerPage);
    lep.util.assertString(labelPattern, 'Invalid labelPattern {labelPattern} for ValueSet.createUserControlsValueSet', labelPattern);
    lep.util.assert(/{}.*{}/.test(labelPattern), 'Missing placeholders in "{}" for ValueSet.createUserControlsValueSet', labelPattern);

    var userControlBank = host.createUserControls(numberOfPages * userControlsPerPage);

    return new lep.ValueSet('UserControls', userControlsPerPage, numberOfPages, function(indexInPage, page, indexInUcBank) {
        var label = lep.util.formatString(labelPattern, page + 1, indexInPage + 1);
        return lep.StandardRangedValue.createUserControlValue(userControlBank, indexInUcBank, label);
    });
};

/**
 * @callback valueCreationFn
 * @param {number} colIndex
 * @param {number}rowIndex
 * @param {number} totalIndex
 * @return {lep.BaseValue}
 */
