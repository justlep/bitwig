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
        var self = this,
            PARAMS_PER_PAGE = 8,
            INSTANCE_NAME = 'ParamsValueSet' + lep.ParamsValueSet.instances.push(this),
            TRACK_VIEW = new lep.SelectedTrackView(),
            CURSOR_DEVICE = TRACK_VIEW.getCursorTrack().createCursorDevice(),
            REMOTE_CONTROL_PAGE = (followsSelectedPage !== false) ?
                                            CURSOR_DEVICE.createCursorRemoteControlsPage(PARAMS_PER_PAGE) :
                                            CURSOR_DEVICE.createCursorRemoteControlsPage(INSTANCE_NAME, PARAMS_PER_PAGE, '');

        this._super(INSTANCE_NAME, PARAMS_PER_PAGE, 1, function(paramIndex) {
            return lep.StandardRangedValue.createRemoteControlValue(REMOTE_CONTROL_PAGE, paramIndex);
        });

        var _effectiveCurrentPage = this.currentPage,
            _paramPageNames = [];

        this.trackView = TRACK_VIEW;
        this.deviceName = ko.observable('');

        this.selectNextDevice = function() {
            CURSOR_DEVICE.selectNext();
        };
        this.selectPreviousDevice = function() {
            CURSOR_DEVICE.selectPrevious();
        };

        this.lockedToDevice = ko.computed({
            read: ko.observable(false).updatedByBitwigValue(CURSOR_DEVICE.isPinned()),
            write: function(doLock) {
                CURSOR_DEVICE.isPinned().set(!!doLock);
            }
        }).extend({toggleable: true});

        // make track lock-status follow device lock-status
        this.lockedToDevice.subscribe(function(isLocked) {
            self.trackView.locked(isLocked);
            if (!isLocked) {
                host.showPopupNotification('RC unlocked');
            }
        });

        ko.computed(function() {
            var deviceNameLocked = self.lockedToDevice() && self.deviceName();
            if (deviceNameLocked) {
                host.showPopupNotification('RC locked to ' + deviceNameLocked);
            }
        });

        this.gotoDevice = function() {
            TRACK_VIEW.getCursorTrack().selectInEditor();
            CURSOR_DEVICE.selectInEditor();
        };

        this.toggleDeviceWindow = function() {
            CURSOR_DEVICE.isWindowOpen().toggle();
        };

        /**
         * @override
         */
        this.currentPage = ko.computed({
            read: _effectiveCurrentPage,
            write: function(_newPageIndex) {
                var newPageIndex = lep.util.limitToRange(_newPageIndex, 0, self.lastPage());
                lep.logDev('setParameterPage({})', newPageIndex);
                REMOTE_CONTROL_PAGE.selectedPageIndex().set(newPageIndex);
            }
        });

        REMOTE_CONTROL_PAGE.selectedPageIndex().addValueObserver(function(newCurrentPage) {
            _effectiveCurrentPage(newCurrentPage);
            var newParameterPageName = _paramPageNames[newCurrentPage] || '-default-';
            lep.logDebug('Selected parameter page: {}', newParameterPageName);
            self.popupNotificationIfAttached('Parameter Page: ' + newParameterPageName);
        }, -1);

        REMOTE_CONTROL_PAGE.pageNames().addValueObserver(function(pageNamesArrayValue) {
            _paramPageNames = [];
            for (var nameIndex in pageNamesArrayValue) {
                _paramPageNames.push(pageNamesArrayValue[nameIndex]);
            }
            self.lastPage(_paramPageNames.length - 1);
        });

        CURSOR_DEVICE.name().addValueObserver(function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName || '_nodevname_');
        });
    },

    /**
     * @return {lep.KnockoutSyncedValue}
     */
    getDefaultPinnedToDeviceKoSyncedValue: function() {
        var KEY = '__ptdksv__';
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