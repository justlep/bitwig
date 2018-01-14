/**
 * Represents a knockout-enhanced, windowed view on launchable clip slots,
 * Default orientation: Scenes x Tracks
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {string} name
 * @param {number} numTracks
 * @param {number} numSends
 * @param {?number} [numScenes] - optional; must be 0 or empty if no `trackBank` is given
 * @param {?TrackBank} [trackBank] - if null, a MainTrackBank with 0 scenes will be created
 * @constructor
 * @extends lep.TrackWindow
 */
lep.MatrixWindow = lep.util.extendClass(lep.TrackWindow, {
    _init: function(name, numTracks, numSends, numScenes, trackBank) {
        lep.util.assertNumberInRange(numScenes, 2, lep.TrackWindow.MAX_SCENES, 'Invalid numScenes={} for MatrixWindow {}', numScenes, name);
        this._super.apply(this, arguments);

        var self = this,
            totalLauncherSlots = numTracks * numScenes,
            // sceneBank = trackBank.sceneBank(),
            /** @type {ClipLauncherSlotBank[]} */
            slotBanksByTrack = this.tracks.map(function(track) {
                var slotBank = track.clipLauncherSlotBank();
                slotBank.setIndication(true);
                return slotBank;
            }),
            /** @type {lep.LauncherSlot[]} */
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

        this.sceneScrollSize = (function(_obs) {
            return ko.computed({
                read: _obs,
                write: function(newScrollSize) {
                    lep.util.assertNumberInRange(newScrollSize, 1, numScenes, 'Invalid new sceneScrollSize "{}" for {}',
                                                                              newScrollSize, self.name);
                    _obs(newScrollSize);
                    host.showPopupNotification('Scenes per scroll: ' + newScrollSize);
                }
            });
        })(ko.observable(1));

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
            self.trackBank.scrollToScene( self.sceneScrollPosition() + self.sceneScrollSize() );
        };
        this.moveScenePageForth = function() {
            self.trackBank.scrollScenesPageDown();
        };
        this.moveSceneBack = function() {
            self.trackBank.scrollToScene( Math.max(0, self.sceneScrollPosition() - self.sceneScrollSize()) );
        };
        this.moveScenePageBack = function() {
            self.trackBank.scrollToScene( Math.max(0, self.sceneScrollPosition() - numScenes) );
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

        this.moveMatrixUp = function(onePage) {
            void( onePage ? ( self.isOrientationTracksByScenes() ? self.moveScenePageBack() : self.moveChannelPageBack() ) :
                            ( self.isOrientationTracksByScenes() ? self.moveSceneBack() : self.moveChannelBack() ));
        };
        this.moveMatrixDown = function(onePage) {
            void( onePage ? ( self.isOrientationTracksByScenes() ? self.moveScenePageForth() : self.moveChannelPageForth() ) :
                            ( self.isOrientationTracksByScenes() ? self.moveSceneForth() : self.moveChannelForth() ));
        };
        this.moveMatrixLeft = function(onePage) {
            void( onePage ? ( self.isOrientationTracksByScenes() ? self.moveChannelPageBack() : self.moveScenePageBack() ) :
                            ( self.isOrientationTracksByScenes() ? self.moveChannelBack() : self.moveSceneBack() ));
        };
        this.moveMatrixRight = function(onePage) {
            void( onePage ? ( self.isOrientationTracksByScenes() ? self.moveChannelPageForth() : self.moveScenePageForth() ) :
                            ( self.isOrientationTracksByScenes() ? self.moveChannelForth() : self.moveSceneForth() ));
        };

        /**
         * Generates a ControlSet instance that fits all launcherSlots of this MatrixWindow.
         * @param {function} controlCreatorFn - a function that creates the controls, e.g. function(colIndex, rowIndex, absoluteIndex){}
         * @return {lep.ControlSet}
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
         * @return {lep.ValueSet}
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
         * @param {launcherSlotValueCreatorFn} valueCreatorFn - a function returning a BaseValue instance for a given launcherSlot
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
                    return tracksByScenesValueSet.values[ (sceneIndex * numTracks) + trackIndex ];
                });
                lep.logDev('Prepared ValueSet: {}', scenesByTrackValueSet.name);
            }
            _slotLauncherValueSets.tracksByScenes(tracksByScenesValueSet);
            _slotLauncherValueSets.scenesByTracks(scenesByTrackValueSet);
        };
    }
});

/**
 * @callback launcherSlotValueCreatorFn
 * @param {lep.LauncherSlot}
 * @return {lep.BaseValue}
 */

/**
 * Creates a MatrixWindow instance with a main track bank.
 * Includes generating the launcher slot valuesets using the given creator function.
 *
 * @param {number} numTracks
 * @param {number} numSends
 * @param {number} numScenes
 * @param {launcherSlotValueCreatorFn} launcherSlotValueCreatorFn, e.g. function(
 * @return {lep.MatrixWindow}
 * @static
 */
lep.MatrixWindow.createMain = function(numTracks, numSends, numScenes, launcherSlotValueCreatorFn) {
    lep.util.assertFunction(launcherSlotValueCreatorFn, 'Invalid launcherSlotValueCreatorFn for MatrixWindow.createMain');
    var matrixWindow = new lep.MatrixWindow('MainMatrixWindow', numTracks, numSends, numScenes);
    matrixWindow.prepareLauncherSlotValueSets(launcherSlotValueCreatorFn);
    return matrixWindow;
};