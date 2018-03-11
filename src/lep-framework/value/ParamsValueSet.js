/**
 * Represents a ValueSet of parameters from the Device Pages.
 *
 * @constructor
 * @extends {lep.ValueSet}
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {
    /**
     * @param {boolean} [followsSelectedPage=true] - if true, the ValueSet's current page follows the selection in the DAW
     * @constructs
     */
    _init: function(followsSelectedPage) {
        const
            PARAMS_PER_PAGE = 8,
            INSTANCE_NAME = 'ParamsValueSet' + lep.ParamsValueSet.instances.push(this),
            self = this,
            _trackView = new lep.SelectedTrackView(),
            _cursorDevice = _trackView.getCursorTrack().createCursorDevice(),
            _remoteControlsPage = (followsSelectedPage !== false) ?
                                            _cursorDevice.createCursorRemoteControlsPage(PARAMS_PER_PAGE) :
                                            _cursorDevice.createCursorRemoteControlsPage(INSTANCE_NAME, PARAMS_PER_PAGE, '');


        this._super(INSTANCE_NAME, PARAMS_PER_PAGE, 1, function(paramIndex) {
            return lep.StandardRangedValue.createRemoteControlValue(_remoteControlsPage, paramIndex);
        });

        var _effectiveCurrentPage = this.currentPage,
            _paramPageNames = [],
            popupNotification = function(message) {
                if (self.controlSet.peek()) {
                    host.showPopupNotification(message);
                }
            };

        this.trackView = _trackView;
        this.deviceName = ko.observable('');

        this.selectNextDevice = function() {
            _cursorDevice.selectNext();
        };
        this.selectPreviousDevice = function() {
            _cursorDevice.selectPrevious();
        };

        this.lockedToDevice = ko.computed({
            read: ko.observable(false).updatedByBitwigValue(_cursorDevice.isPinned()),
            write: function(doLock) {
                _cursorDevice.isPinned().set(!!doLock);
            }
        }).extend({toggleable: true});

        // Track lock-status follows device lock-status
        this.lockedToDevice.subscribe(function(locked) {
            if (locked) {
                popupNotification('RC control locked to ' + self.deviceName());
            }
            self.trackView.locked(locked);
        });

        this.gotoDevice = function() {
            _trackView.getCursorTrack().selectInEditor();
            _cursorDevice.selectInEditor();
        };

        this.toggleDeviceWindow = function() {
            _cursorDevice.isWindowOpen().toggle();
        };

        /**
         * @override
         */
        this.currentPage = ko.computed({
            read: _effectiveCurrentPage,
            write: function(_newPageIndex) {
                var newPageIndex = lep.util.limitToRange(_newPageIndex, 0, self.lastPage());
                lep.logDev('setParameterPage({})', newPageIndex);
                _remoteControlsPage.selectedPageIndex().set(newPageIndex);
            }
        });

        _remoteControlsPage.selectedPageIndex().addValueObserver(function(newCurrentPage) {
            _effectiveCurrentPage(newCurrentPage);
            var newParameterPageName = _paramPageNames[newCurrentPage] || '-default-';
            lep.logDebug('Selected parameter page: {}', newParameterPageName);
            popupNotification('Parameter Page: ' + newParameterPageName);
        }, -1);

        _remoteControlsPage.pageNames().addValueObserver(function(pageNamesArrayValue) {
            _paramPageNames = [];
            for (var nameIndex in pageNamesArrayValue) {
                _paramPageNames.push(pageNamesArrayValue[nameIndex]);
            }
            self.lastPage(_paramPageNames.length - 1);
        });

        _cursorDevice.name().addValueObserver(function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName || '_nodevname_');
        });
    },

    /**
     * @return {lep.KnockoutSyncedValue}
     */
    getPinnedToDeviceKoSyncedValue: function() {
        const KEY = '__ptdksv__';
        if (!this[KEY]) {
            this[KEY] = new lep.KnockoutSyncedValue({
                name: 'PinnedToDevice4' + this.name,
                ownValue: true,
                refObservable: this.lockedToDevice,
                onClick: this.lockedToDevice.toggle
            });
        }
        return this[KEY];
    }
});

/** @type {lep.ParamsValueSet[]} */
lep.ParamsValueSet.instances = [];