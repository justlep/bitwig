/**
 * Represents the Morpher, used to merge ValueSetSnapshots into the current target valueSet.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */
lep.Morpher = (function() {

    var instance = null,
        getInstance = function(numberOfSnapshots, maxMorphableParamsNumber, isShiftPressed) {
            if (!instance) {
                instance = new Morpher(numberOfSnapshots, maxMorphableParamsNumber, isShiftPressed);
            }
            return instance;
        },
        /**
         * The absolute max for the 'maxMorphableParamsNumber', otherwise an error is thrown upon instantiation.
         * Too many parameters may slow down Bitwig massively.
         */
        ABSOLUTE_MAX_PARAMS_NUMBER = 100;

    /**
     * @constructor
     */
    function Morpher(numberOfSnapshots, maxParamsNumber, isShiftPressed) {
        lep.util.assertNumberInRange(numberOfSnapshots, 1, 8, 'Invalid SNAPSHOT_NUMBER for Morpher: {}', numberOfSnapshots);
        lep.util.assertNumberInRange(maxParamsNumber, 1, ABSOLUTE_MAX_PARAMS_NUMBER,
                                     'Invalid maxParamsNumber for Morpher: {}', maxParamsNumber);
        lep.util.assertObservable(isShiftPressed, 'Invalid isShiftPressed observable for Morpher');

        lep.logDebug('Creating Morpher: {} snapshots, max {} params each', numberOfSnapshots, maxParamsNumber);

        var snapshotObservables = (function() {
                var obsArr = [];
                for (var snapshotIndex = 0; snapshotIndex< numberOfSnapshots; snapshotIndex++) {
                    obsArr[snapshotIndex] = ko.observable();
                }
                return obsArr;
            })(),
            weightsValueSet = new lep.ValueSet('Morpher Weights', 1, numberOfSnapshots, function(snapshotIndex) {
                return new lep.MorphWeightValue(snapshotIndex, morph, snapshotObservables[snapshotIndex]);
            }),
            snapshotSelectValueSet = new lep.ValueSet('Morpher Snapshots', 1, numberOfSnapshots, function(snapshotIndex) {
                return new lep.KnockoutSyncedValue({
                    name: 'MorphSnapshotSelect' + snapshotIndex,
                    ownValue: true,
                    refObservable: ko.computed(function(){
                        return !!snapshotObservables[snapshotIndex]();
                    }),
                    onClick: function() {
                        if (isShiftPressed()) {
                            saveSnapshot(snapshotIndex);
                        } else {
                            loadSnapshotAndSetAsReference(snapshotIndex);
                        }
                    }
                });
            }),
            selectedValuesValueSet = new lep.ValueSet('Morpher params', 1, maxParamsNumber, function(index) {
                return new lep.BaseValue({
                    name: 'MorphParamSelected' + index,
                    syncToDaw: morph
                })
            }),
            savedSnapshotsByValueSetId = [],
            previousValueSetToRestore = null,
            currentWeightsControlSet = null,
            _isActive = ko.observable(false),
            targetValueSetObservable = null,
            isTargetValueSetReady = false,
            targetValueSet = null,
            targetSize = 0,
            self = this,
            currentReferenceValues = null;

        this.id = lep.util.nextId();

        ko.computed(function() {
            if (!_isActive()) return;
            targetValueSet = targetValueSetObservable();
            isTargetValueSetReady = (targetValueSet instanceof lep.ValueSet);
            if (!isTargetValueSetReady) {
                lep.logDebug('Morpher waiting for new targetValueSet...');
                return;
            }
            targetSize = targetValueSet.values.length;
            resetWeightValues();
            recallSnapshotsForValueSet();
            lep.logDebug('Morpher has new targetValueSet "{}" with {} values', targetValueSetObservable().name, targetSize);
        });

        function recallSnapshotsForValueSet() {
            for (var i=0; i<numberOfSnapshots; i++) {
                snapshotObservables[i]( (savedSnapshotsByValueSetId[targetValueSet.id]||[])[i] );
            }
            currentReferenceValues = null;
        }

        function saveSnapshot(snapshotIndex) {
            // if (!isTargetValueSetReady) return;
            var rawValues = [];
            for (var i = targetSize-1; i >= 0; i--) {
                rawValues[i] = targetValueSet.values[i].value || 0;
            }
            snapshotObservables[snapshotIndex](rawValues);
            if (!savedSnapshotsByValueSetId[targetValueSet.id]) {
                savedSnapshotsByValueSetId[targetValueSet.id] = [];
            }
            savedSnapshotsByValueSetId[targetValueSet.id][snapshotIndex] = rawValues;
            // morph();
            lep.logDebug('Saved snapshot in slot {}', snapshotIndex);
        }

        function loadSnapshotAndSetAsReference(snapshotIndex) {
            var rawValues = snapshotObservables[snapshotIndex]();
            if (rawValues) {
                currentReferenceValues = rawValues;
                lep.util.startTimer(self.id);
                for (var i = targetSize- 1; i >= 0; i--) {
                    targetValueSet.values[i].setValue(rawValues[i]);
                }
                lep.logDebug('Snapshot{} loaded within {} millis', snapshotIndex, lep.util.stopTimer(self.id));
                markReferenceSnapshotSelected(snapshotIndex);
            } else {
                lep.logDebug('Cannot load snapshot from empty slot {}', snapshotIndex);
            }
        }

        function resetWeightValues() {
            for (var i = 0; i < weightsValueSet.values.length; i++) {
                weightsValueSet.values[i].setValue(0, true);
            }
        }

        /**
         * Marks the currently selected snapshot channel by slightly lifting its corresponding morph fader
         * while resetting all other faders.
         * @param snapshotIndex (Number) the index of the fader to lift
         */
        function markReferenceSnapshotSelected(snapshotIndex) {
            for (var i = 0, newWeightValueToSet; i < weightsValueSet.values.length; i++) {
                newWeightValueToSet = (snapshotIndex === i) ? 20 : 0;
                weightsValueSet.values[i].setValue(newWeightValueToSet, true);
            }
        }

        function morph() {
            if (!currentReferenceValues) return;

            var referenceValues = currentReferenceValues, // TODO check if pulling the var here makes any timing difference
                totalWeight = 0,
                snapshotIndexesToVisit = [],
                weightByIndexMap = [],
                snapshotIndex,
                weight,
                normalizationFactor,
                valueIndex,
                useValue = true, // TODO implement later: enable/disable per parameter whether its being morphed or not
                weightValue;

            for (snapshotIndex = numberOfSnapshots-1; snapshotIndex >= 0; snapshotIndex--) {
                weightValue = weightsValueSet.values[snapshotIndex];
                weight = weightValue.value;
                if (weightValue.useForMorph && weight) {
                    weightByIndexMap[snapshotIndex] = weight;
                    totalWeight += weight;
                    snapshotIndexesToVisit.push(snapshotIndex);
                }
            }
            if (!totalWeight) return;

            var diffs = lep.util.generateArray(referenceValues.length, 0),
                snapshotValues;

            for (var i = snapshotIndexesToVisit.length-1; i >= 0; i--) {
                if (!useValue) continue;
                snapshotIndex = snapshotIndexesToVisit[i];
                weight = weightByIndexMap[snapshotIndex];
                normalizationFactor = (weight / totalWeight) * (weight / 127);
                snapshotValues = snapshotObservables[snapshotIndex]();

                for (valueIndex = referenceValues.length-1; valueIndex >= 0; valueIndex--) {
                    diffs[valueIndex] += (snapshotValues[valueIndex] - referenceValues[valueIndex]) * normalizationFactor;
                }
            }

            for (valueIndex = referenceValues.length-1; valueIndex >= 0; valueIndex--) {
                if (!useValue) continue;
                var morphedValue = referenceValues[valueIndex] + Math.round(diffs[valueIndex]);
                targetValueSet.values[valueIndex].setValue(morphedValue);
            }
        }

        this.isActive = ko.computed({read: _isActive});

        /**
         * Activates the Morpher.
         * Morpher will take control over the given controlSetForWeights (using it for its morph weights).
         * The valueSet that was assigned before is saved and will be passed to the callback of {@link #deactivate}.
         * @param controlSetForWeights (ControlSet) the controlSet Morpher can use (exclusively) for its weights
         * @param newTargetValueSetObservable (Observable) containing the valueSet to morph
         */
        this.activate = function(controlSetForWeights, newTargetValueSetObservable) {
            lep.util.assertControlSet(controlSetForWeights, 'Missing or invalid weightsControlSet for Morpher.activate');
            lep.util.assertObservable(newTargetValueSetObservable, 'Invalid targetValueSetObservable for Morpher.activate');
            if (_isActive()) return;
            lep.logDebug('Enabling morpher');
            previousValueSetToRestore = controlSetForWeights.valueSet();
            controlSetForWeights.setValueSet(weightsValueSet);
            currentWeightsControlSet = controlSetForWeights; // save for restore on deactivate
            if (targetValueSetObservable !== newTargetValueSetObservable) {
                targetValueSetObservable = newTargetValueSetObservable;
            }
            _isActive(true);
            lep.logDebug('Morpher activated');
        };

        /**
         * Deactivates the morpher, detaching its weightsValueSet from the controlSet.
         * Then passes the old valueSet to the given valueSetRestoreCallback, so the caller can decide
         * if the old valueSet can be re-attached to the same controlSet.
         * @param valueSetRestoreCallback (function) called on switch-off, e.g. function(previousValueSetToRestore){..}
         */
        this.deactivate = function(valueSetRestoreCallback) {
            lep.util.assertFunction(valueSetRestoreCallback, 'Missing or invalid valueSetRestoreCallback for Morpher.deactivate()');
            if (!_isActive()) return;
            lep.logDebug('Disabling morpher');
            _isActive(false);
            currentWeightsControlSet.reset();
            valueSetRestoreCallback(previousValueSetToRestore);
        };

        this.getSnapshotSelectValueSet = function() {
            return snapshotSelectValueSet;
        };
        this.getSelectedValuesValueSet = function() {
            return selectedValuesValueSet;
        };
    }

    return {
        /** @static */
        getInstance: getInstance
    };

})();
