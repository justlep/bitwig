/**
 * Represents a knockout-enhanced, windowed view on launchable clip slots,
 * Default orientation: Scenes x Tracks
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param name {String}
 * @param numTracks {Number}
 * @param numSends {Number}
 * @param [numScenes] {Number} optional; must be 0 or empty if no `trackBank` is given
 * @param [trackBank] {TrackBank|null} if null, a MainTrackBank with 0 scenes will be created
 * @constructor
 */
lep.MatrixWindow = lep.util.extendClass(lep.TrackWindow, {
    _init: function(name, numTracks, numSends, numScenes, trackBank) {
        lep.util.assertNumberInRange(numScenes, 2, lep.TrackWindow.MAX_SCENES, 'Invalid numScenes={} for MatrixWindow {}', numScenes, name);
        this._super.apply(this, arguments);

        var self = this,
            totalLauncherSlots = numTracks * numScenes,
            // sceneBank = trackBank.sceneBank(),
            slotBanksByTrack = this.tracks.map(function(track) {
                var slotBank = track.clipLauncherSlotBank();
                slotBank.setIndication(true);
                return slotBank;
            }),
            launcherSlots = lep.util.generateArrayTableBased(numTracks, numScenes, function(trackIndex, sceneIndex, index) {
                return new lep.LauncherSlot(trackIndex, sceneIndex, slotBanksByTrack[trackIndex]);
            }),
            totalSelectableScenes = ko.observable(1000), // FIXME it is even possible to determine this number?
            maxScrollPosition = ko.computed(function() {
                return totalSelectableScenes() - numScenes;
            }),
            _slotLauncherValueSets = {
                tracksByScenes: ko.observable(null),
                scenesByTracks: ko.observable(null)
            };

        // init state observers for slots
        slotBanksByTrack.forEach(function(slotBank, trackIndex) {
            // has-content-state
            slotBank.addHasContentObserver(function(sceneIndex, hasContent) {
                var launcherSlot = launcherSlots[ (sceneIndex * numTracks) + trackIndex ];
                // lep.logDev('New hasContent for {} -> {}', launcherSlot.name, hasContent);
                launcherSlot.hasContent(hasContent);
            });

            // playback-state
            slotBank.addPlaybackStateObserver(function(sceneIndex, slotState, isQueued) {
                var launcherSlot = launcherSlots[ (sceneIndex * numTracks) + trackIndex ],
                    isStop = (slotState === 0),
                    isPlay = (slotState === 1),
                    isRecord = (slotState === 2);

                launcherSlot.updatePlayStateByFlags(isStop, isPlay, isRecord, isQueued);
            });
        });

        this.canRotate = ko.computed(function() {
            return (numTracks === numScenes);
        });

        this.isOrientationTracksByScenes = (function(_obs) {
            return ko.computed({
                read: _obs,
                write: function(newVal) {
                    lep.util.assert(self.canRotate(), 'Cannot change orientation of asymmetrical {}', self.name);
                    _obs(newVal);
                }
            });
        })( ko.observable(true) ).extend({toggleable: true});

        this.rotate = this.isOrientationTracksByScenes.toggle;

        this.sceneScrollPosition = ko.observable(0).updatedBy(function(obs) {
            self.trackBank.addSceneScrollPositionObserver(obs, 0);
        });
        this.canMoveSceneBack = ko.computed(function() {
            return !!self.sceneScrollPosition();
        });
        this.canMoveSceneForth = ko.computed(function() {
            return self.sceneScrollPosition() < maxScrollPosition();
        });

        this.moveSceneForth = function() {
            self.trackBank.scrollScenesDown();
        };
        this.moveScenePageForth = function() {
            self.trackBank.scrollScenesPageDown();
        };
        this.moveSceneBack = function() {
            self.trackBank.scrollScenesUp();
        };
        this.moveScenePageBack = function() {
            var newScenePos = Math.max(0, self.sceneScrollPosition() - numScenes);
            self.trackBank.scrollToScene(newScenePos);
        };

        this.canMoveMatrixUp = ko.computed(function(){
            return self.isOrientationTracksByScenes() ? self.canMoveSceneBack() : self.canMoveChannelBack();
        });
        this.canMoveMatrixDown = ko.computed(function(){
            return self.isOrientationTracksByScenes() ? self.canMoveSceneForth() : self.canMoveChannelForth();
        });
        this.canMoveMatrixLeft = ko.computed(function(){
            return self.isOrientationTracksByScenes() ? self.canMoveChannelBack() : self.canMoveSceneBack();
        });
        this.canMoveMatrixRight = ko.computed(function(){
            return self.isOrientationTracksByScenes() ? self.canMoveChannelForth() : self.canMoveSceneForth();
        });

        this.moveMatrixUp = function() {
            void( self.isOrientationTracksByScenes() ? self.moveSceneBack() : self.moveChannelBack() );
        };
        this.moveMatrixDown = function() {
            void( self.isOrientationTracksByScenes() ? self.moveSceneForth() : self.moveChannelForth() );
        };
        this.moveMatrixLeft = function() {
            void( self.isOrientationTracksByScenes() ? self.moveChannelBack() : self.moveSceneBack() );
        };
        this.moveMatrixRight = function() {
            void( self.isOrientationTracksByScenes() ? self.moveChannelForth() : self.moveSceneForth() );
        };

        /**
         * Generates a ControlSet instance that fits all launcherSlots of this MatrixWindow.
         * @param controlCreatorFn {function} a function that creates the controls, e.g. function(colIndex, rowIndex, absoluteIndex){}
         * @returns {lep.ControlSet}
         */
        this.createMatrixControlSet = function(controlCreatorFn) {
            return new lep.ControlSet('Matrix', totalLauncherSlots, function(index) {
                var rowIndex = Math.floor(index / numTracks),
                    colIndex = index % numTracks;

                return controlCreatorFn(colIndex, rowIndex, index);
            });
        };

        /**
         * Returns one of the LauncherSlot valuesets which have been prepared by {@link prepareLauncherSlotValueSets}.
         * The returned set depends on the current orientation.
         * @returns {ValueSet}
         */
        this.launcherSlotValueSet = ko.computed(function() {
            var isTracksByScenes = self.isOrientationTracksByScenes(),
                valueSet = isTracksByScenes ? _slotLauncherValueSets.tracksByScenes() : _slotLauncherValueSets.scenesByTracks();

            if (!valueSet) {
                lep.logWarn('MatrixWindow.prepareLauncherSlotValueSets() should be called prior to launcherSlotValueSet');
            }
            host.showPopupNotification('APCmini axis: ' + (isTracksByScenes ? '↓ Scenes · Tracks →' : '↓ Tracks · Scenes →'));
            return valueSet;
        });

        /**
         * Generates a ValueSet (or two) containing `BaseValue` instances for all LauncherSlots of the matrix.
         * The BaseValue instances are generated by the given `valueCreatorFn`.
         * If the matrix is rotatable, the second Valueset (for the alternative orientation)
         * will SHARE the first ValueSet's values.
         * The generated ValueSets can later be obtained via the
         *
         * @param valueCreatorFn {function} a function supposed to return the {@link BaseValue} instances for the set,
         *                                  e.g. function(launcherSlot) { return new BaseValue(..) }
         */
        this.prepareLauncherSlotValueSets = function(valueCreatorFn) {
            lep.util.assert(!_slotLauncherValueSets.tracksByScenes() && !_slotLauncherValueSets.scenesByTracks(),
                            'Multiple call of MatrixWindow.prepareLauncherSlotValueSets');
            var tracksByScenesValueSet = new lep.ValueSet('LauncherSlotValues(TbS)', totalLauncherSlots, 1, function(launcherSlotIndex) {
                    return valueCreatorFn( launcherSlots[launcherSlotIndex] );
                }),
                scenesByTrackValueSet = null;

            lep.logDev('Prepared ValueSet: {}', tracksByScenesValueSet.name);

            if (self.canRotate()) {
                // generate a swapped-axis version of the `tracksByScenesValueSet`
                scenesByTrackValueSet = new lep.ValueSet('LauncherSlotValues(SbT)', numScenes, numTracks, function(sceneIndex, trackIndex) {
                    var sourceValueIndex = (trackIndex * numTracks) + sceneIndex;
                    return tracksByScenesValueSet.values[sourceValueIndex];
                });
                lep.logDev('Prepared ValueSet: {}', scenesByTrackValueSet.name);
            }
            _slotLauncherValueSets.tracksByScenes(tracksByScenesValueSet);
            _slotLauncherValueSets.scenesByTracks(scenesByTrackValueSet);
        };
    }
});

/**
 * Creates a MatrixWindow instance with a main track bank.
 * @param numTracks {Number}
 * @param numSends {Number}
 * @param numScenes {Number}
 * @static
 */
lep.MatrixWindow.createMain = function(numTracks, numSends, numScenes) {
    return new lep.MatrixWindow('MainMatrixWindow', numTracks, numSends, numScenes);
};