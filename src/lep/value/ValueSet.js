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
    lep.util.assert(!lep.ValueSet.instancesByName[name], 'ValueSet with name "{}" already exists', name);
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
lep.ValueSet.MAX_SIZE = 100;

lep.ValueSet.prototype = {
    /**
     * Returns true if the tihs valueSet is currently assigned to any ControlSet.
     */
    isControlled: function() {
        return !!lep.ControlSet.instanceByValueSetId[this.id];
    }
};