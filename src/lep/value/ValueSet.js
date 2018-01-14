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
 * @constructor
 */
lep.ValueSet = function(name, cols, rows, valueCreationFn) {
    lep.util.assertString(name, 'Invalid name for ValueSet');
    lep.util.assert(!lep.ValueSet.exists(name), 'ValueSet with name "{}" already exists', name);
    lep.util.assertNumber(rows, 'Invalids rows for ValueSet: {}', rows);
    lep.util.assertNumber(cols, 'Invalid cols for ValueSet: {}', cols);
    lep.util.assertNumberInRange(rows * cols, 1, lep.ValueSet.MAX_SIZE, 'Invalid size for ValueSet (actual: {}, max: {})',
                                 rows * cols, lep.ValueSet.MAX_SIZE);
    lep.util.assertFunction(valueCreationFn, 'Invalid valueCreationFn for ValueSet');

    this.id = lep.util.nextId();
    this.name = name;
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

    this.controlSet = ko.observable().withSubscription(function(newControlSet) {
        var message = newControlSet ? 'ValueSet {} now controlled by {}' : 'ValueSet {} is detached';
        lep.logDebug(message, this.name, newControlSet && newControlSet.name || '???');
    }, this);

    lep.ValueSet.instancesByName[this.name] = this;
};

/**
 * @type {Object.<string,lep.ValueSet>}
 */
lep.ValueSet.instancesByName = {};

/**
 * @param {string} name - a value set name
 * @return {boolean}
 */
lep.ValueSet.exists = function(name) {
    return !!lep.ValueSet.instancesByName[name];
};

/** @static */
lep.ValueSet.MAX_SIZE = 100;

lep.ValueSet.prototype = {
    /**
     * Returns true if the this valueSet is currently bound to any ControlSet.
     * @return {boolean}
     */
    isControlled: function() {
        return !!this.valueSet.peek();
    },
    /**
     * Returns this valueSet's id which may not necessarily be constant.
     * To be overridden by derived device-specific ValueSet (see {@link ParamsValueSet}.
     * @return {string}
     */
    dynamicId: function() {
        return this.id + '_' + this.name;
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

    var name = (lep.ValueSet.exists('Sends') && allowSecondInstance) ? 'Sends2' : 'Sends';

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
