/**
 * Represents a ValueSet of parameters from the Device Pages.
 * This valueset can be locked
 *  - to a selected device, so stays in control of the device even when a different device (or even track) is selected in the GUI
 *  - to a device parameter page, so it remains in control of that page of parameters even if the user
 *    (or another another MIDI controller's ParamsValueSet) selects a different parameter page visible in the GUI
 *
 * @constructor
 * @extends {lep.ValueSet}
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {
    /**
     * @constructs
     */
    _init: function() {
        var self = this,
            PARAMS_PER_PAGE = 8,
            INSTANCE_NAME = 'ParamsValueSet' + lep.ParamsValueSet.instances.push(this),
            TRACK_VIEW = new lep.SelectedTrackView(),
            CURSOR_DEVICE = TRACK_VIEW.getCursorTrack().createCursorDevice(),
            REMOTE_CONTROL_PAGE_AUTOFOLLOWING = CURSOR_DEVICE.createCursorRemoteControlsPage(PARAMS_PER_PAGE),
            REMOTE_CONTROL_PAGE = CURSOR_DEVICE.createCursorRemoteControlsPage(INSTANCE_NAME, PARAMS_PER_PAGE, ''),
            _settableAutofollowingPage = REMOTE_CONTROL_PAGE_AUTOFOLLOWING.selectedPageIndex(),
            _settableNonAutofollowingPage = REMOTE_CONTROL_PAGE.selectedPageIndex(),
            _currentAutofollowingPage = ko.observable(0).updatedByBitwigValue(_settableAutofollowingPage),
            _currentParameterPageName = ko.observable(''),
            _paramPageNames = [];


        this._super(INSTANCE_NAME, PARAMS_PER_PAGE, 1, function(paramIndex) {
            return lep.StandardRangedValue.createRemoteControlValue(REMOTE_CONTROL_PAGE, paramIndex);
        });

        var _effectiveCurrentPage = this.currentPage;

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

        this.toggleRemoteControlsSection = function() {
            CURSOR_DEVICE.isRemoteControlsSectionVisible().toggle();
        };

        this.toggleDeviceWindow = function() {
            CURSOR_DEVICE.isWindowOpen().toggle();
        };

        this.lockedToPage = ko.observable(false).extend({toggleable: true});

        /**
         * @override
         */
        this.currentPage = ko.computed({
            read: _effectiveCurrentPage,
            write: function(_newPageIndex) {
                var newPageIndex = lep.util.limitToRange(_newPageIndex, 0, self.lastPage());
                lep.logDebug('setParameterPage({})', newPageIndex);
                if (self.lockedToPage.peek()) {
                    _settableNonAutofollowingPage.set(newPageIndex);
                } else {
                    _settableAutofollowingPage.set(newPageIndex);
                }
            }
        });

        REMOTE_CONTROL_PAGE.selectedPageIndex().addValueObserver(function(newCurrentPage) {
            _effectiveCurrentPage(newCurrentPage);
            var newParameterPageName = _paramPageNames[newCurrentPage] || '-default-';
            lep.logDebug('Selected parameter page: {}', newParameterPageName);
            self.popupNotificationIfAttached('Parameter Page: ' + newParameterPageName);
            _currentParameterPageName(newParameterPageName);
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
            // if (self.lockedToPage.peek()) {
            //     self.lockedToPage(false);
            // }
        });

        ko.computed(function() {
            if (self.lockedToPage()) {
                if (!self.lockedToDevice.peek()) {
                    self.lockedToDevice(true);
                }
                self.popupNotificationIfAttached('Locked RC page: ' + _currentParameterPageName());
            } else {
                _settableNonAutofollowingPage.set(_currentAutofollowingPage());
            }
        });

        // initially, unlock this instance from any device
        host.scheduleTask(this.lockedToDevice.toggleOff, 200);
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