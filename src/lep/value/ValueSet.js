/**
 * Represents a set of BaseValue (or subclass) objects.
 * @param name (String)
 * @param rows (Number) the number of rows to generate values for
 * @param valuesPerRow (Number) the number of Values to create per row
 * @param valueCreationFn (function) creating a value, e.g.
 *                                      for rows === 1:  function(valueIndex){...; return new Value(..);}
 *                                      for rows > 1:    function(rowIndex, valueIndexInRow){...; return new Value(..);}
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ValueSet = function(name, rows, valuesPerRow, valueCreationFn) {
    lep.util.assertString(name, 'Invalid name for ValueSet');
    lep.util.assert(!lep.ValueSet.exists(name), 'ValueSet with name "{}" already exists', name);
    lep.util.assertNumber(rows, 'Invalids rows for ValueSet: {}', rows);
    lep.util.assertNumber(valuesPerRow, 'Invalid valuesPerRow for ValueSet: {}', valuesPerRow);
    lep.util.assertNumberInRange(rows * valuesPerRow, 1, lep.ValueSet.MAX_SIZE, 'Invalid size for ValueSet (actual: {}, max: {})',
                                 rows * valuesPerRow, lep.ValueSet.MAX_SIZE);
    lep.util.assertFunction(valueCreationFn, 'Invalid valueCreationFn for ValueSet');

    this.id = lep.util.nextId();
    this.name = name;
    this.values = []; // BaseValues, NOT numerical values

    for (var rowIndex = 0, value; rowIndex < rows; rowIndex++) {
        for (var valueIndexInRow = 0; valueIndexInRow < valuesPerRow; valueIndexInRow++) {
            value = (rows > 1) ? valueCreationFn(rowIndex, valueIndexInRow) : valueCreationFn(valueIndexInRow);
            lep.util.assertBaseValue(value, 'Invalid value returned by valueCreationFn in ValueSet');
            lep.logDebug("Created {} for ValueSet {}", value.name, this.name);
            this.values.push(value);
        }
    }

    lep.ValueSet.instancesByName[this.name] = this;
};

/** @static */
lep.ValueSet.instancesByName = {};

/** @static */
lep.ValueSet.exists = function(name) {
    return !!lep.ValueSet.instancesByName[name];
};

/** @static */
lep.ValueSet.MAX_SIZE = 100;

lep.ValueSet.prototype = {
    /**
     * Returns true if the tihs valueSet is currently assigned to any ControlSet.
     */
    isControlled: function() {
        return !!lep.ControlSet.instanceByValueSetId[this.id];
    },
    /**
     * Returns this valueSet's id which may not necessarily be constant.
     * To be overridden by derived device-specific ValueSet (see {@link ParamsValueSet}.
     */
    dynamicId: function() {
        return this.id + '_' + this.name;
    }
};

/** @static */
lep.ValueSet.createSoloValueSet = function(trackBank, windowSize, prefs) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSoloValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSoloValueSet', windowSize);
    lep.util.assertObject(prefs, 'Invalid prefs for ValueSet.createSoloValueSet');
    lep.util.assertBoolean(prefs.soloExclusive, 'Invalid prefs.soloExclusive for ValueSet.createSoloValueSet');

    return new lep.ValueSet('Solo', 1, windowSize, function(channelIndex) {
        return lep.ToggledValue.createSoloValue(trackBank, channelIndex, prefs);
    });
};

/** @static */
lep.ValueSet.createMuteValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createMuteValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createMuteValueSet', windowSize);

    return new lep.ValueSet('Mute', 1, windowSize, function(channelIndex) {
        return lep.ToggledValue.createMuteValue(trackBank, channelIndex);
    });
};

/** @static */
lep.ValueSet.createArmValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createArmValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createArmValueSet', windowSize);

    return new lep.ValueSet('Arm', 1, windowSize, function(channelIndex) {
        return lep.ToggledValue.createArmValue(trackBank, channelIndex);
    });
};

/** @static */
lep.ValueSet.createSelectValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSelectValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSelectValueSet', windowSize);

    return new lep.ValueSet('Select', 1, windowSize, function(channelIndex) {
        return lep.ChannelSelectValue.create(trackBank, channelIndex);
    });
};

/** @static */
lep.ValueSet.createVolumeValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createVolumeValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createVolumeValueSet', windowSize);

    return new lep.ValueSet('Volumes', 1, windowSize, function(index) {
        return lep.StandardRangedValue.createVolumeValue(trackBank, index);
    });
};

/** @static */
lep.ValueSet.createPanValueSet = function(trackBank, windowSize) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createPanValueSet');
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createPanValueSet', windowSize);

    return new lep.ValueSet('Pans', 1, windowSize, function(index) {
        return lep.StandardRangedValue.createPanValue(trackBank, index);
    });
};

/** @static */
lep.ValueSet.createSendsValueSet = function(trackBank, numberOfSends, windowSize, allowSecondInstance) {
    lep.util.assertObject(trackBank, 'Invalid trackBank for ValueSet.createSendsValueSet');
    lep.util.assertNumberInRange(numberOfSends, 1, 20, 'Invalid numberOfSends {} for ValueSet.createSendsValueSet', numberOfSends);
    lep.util.assertNumberInRange(windowSize, 1, 1000, 'Invalid windowSize {} for ValueSet.createSendsValueSet', windowSize);

    var name = (lep.ValueSet.exists('Sends') && allowSecondInstance) ? 'Sends2' : 'Sends';

    return new lep.ValueSet(name, numberOfSends, windowSize, function(sendIndex, channelIndex) {
        return lep.StandardRangedValue.createSendValue(trackBank, channelIndex, sendIndex);
    });
};

/**
 * @static
 * @param  labelPattern (String) label with TWO '{}' placeholders for (1) the 1-based page, (2) the 1-based index within the page
 *                               i.e. a given labelPattern 'UC-{}-{}' will result in UserControls with labels
 *                                 "UC-1-1" to "UC-<numberOfPages>-<userControlsPerPage>"
 */
lep.ValueSet.createUserControlsValueSet = function(numberOfPages, userControlsPerPage, labelPattern) {
    lep.util.assertNumberInRange(numberOfPages, 1, 20, 'Invalid numberOfPages {} for ValueSet.createUserControlsValueSet', numberOfPages);
    lep.util.assertNumberInRange(userControlsPerPage, 1, 20, 'Invalid userControlsPerPage {} for ValueSet.createUserControlsValueSet',
                                                             userControlsPerPage);
    lep.util.assertString(labelPattern, 'Invalid labelPattern {labelPattern} for ValueSet.createUserControlsValueSet', labelPattern);
    lep.util.assert(/\{\}.*\{\}/.test(labelPattern), 'Missing placeholders in "{}" for ValueSet.createUserControlsValueSet', labelPattern);

    var userControlBank = host.createUserControls(numberOfPages * userControlsPerPage);

    return new lep.ValueSet('UserControls', numberOfPages, userControlsPerPage, function(page, indexInPage) {
        var indexInBank = (page * userControlsPerPage) + indexInPage,
            label = lep.util.formatString(labelPattern, page + 1, indexInPage + 1);
        return lep.StandardRangedValue.createUserControlValue(userControlBank, indexInBank, label);
    });
};
