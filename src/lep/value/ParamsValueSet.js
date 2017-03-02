/**
 * Represents a ValueSet of parameters from the Device Pages.
 * Since Bitwig 2, access is unified over the CursorRemoteControlsPage,
 * deprecating old fixed pages (Common, Envelope, Modulation Source) and Macros.
 *
 * @constructor
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {
    /**
     * @param cursorDevice (CursorDevice)
     * @param [optParamsPerPage] (number) optional number of parameters per page (default: 8),
     */
    _init: function(cursorDevice, optParamsPerPage) {
        lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for ParamsValueSet');
        lep.util.assertNumberInRangeOrEmpty(optParamsPerPage, 1, 8);

        var PARAMS_PER_PAGE = lep.util.limitToRange(optParamsPerPage || 8, 1, 8),
            remoteControlsPage = cursorDevice.createCursorRemoteControlsPage(PARAMS_PER_PAGE),
            self = this;

        this._super('ParamsValueSet', 1, 8, function(paramIndex) {
            return lep.StandardRangedValue.createRemoteControlValue(remoteControlsPage, paramIndex);
        });

        var _parameterPagesCount = ko.observable(0),
            _currentPage = ko.observable(0),
            _savedPageByDeviceName = {},
            _paramPageNames = [],
            hasDeviceChanged = false,
            saveParamPageForCurrentDevice = function() {
                _savedPageByDeviceName[self.deviceName()] = _currentPage();
            },
            recallParamPageForDevice = function() {
                hasDeviceChanged = false;
                self.currentPage(_savedPageByDeviceName[self.deviceName()] || 0);
            },
            popupNotification = function(message) {
                var isValueSetAttached = self.values[0].controller;
                if (isValueSetAttached) {
                    host.showPopupNotification(message);
                }
            };

        this.deviceName = ko.observable('');

        /** @Override */
        this.dynamicId = ko.computed(function() {
            return '' + self.id + '_' + self.name + '__' + self.deviceName();
        });

        this.currentPage = ko.computed({
            read: _currentPage,
            write: function(proposedNewPageIndex) {
                if (hasDeviceChanged) {
                    // If the device has changed, recallParamPageForDevice() is the only function allowed to
                    // set the new page, as it will be invoked LAST after lastPage() is determined, too
                    lep.logDebug('Skipped setting new page of ParamValueSet due to prior device change');
                    return;
                }
                var newPageIndex = lep.util.limitToRange(proposedNewPageIndex, 0, self.lastPage()),
                    newParameterPageName = _paramPageNames[newPageIndex] || '-default-';

                lep.logDebug('New page for {} -> proposed: {}, effective: {}', self.name, proposedNewPageIndex, newPageIndex);
                lep.logDebug('setParameterPage({})', newPageIndex);
                remoteControlsPage.selectedPageIndex().set(newPageIndex);

                _currentPage(newPageIndex);
                lep.logDebug('Selected parameter page: {}', newParameterPageName);
                popupNotification('Parameter Page: ' + newParameterPageName);
                saveParamPageForCurrentDevice();
            }
        });

        /** 0-based index of the last selectable value page */
        this.lastPage = ko.computed(function() {
            return _parameterPagesCount() - 1;
        });

        this.lastPage.subscribe(function(newLastPage) {
            lep.logDebug('lastPage changed: {}, fixing old currentPage: {}', newLastPage, self.currentPage());
            if (newLastPage < self.currentPage()) {
                self.currentPage(newLastPage);
            }
        });

        remoteControlsPage.pageNames().addValueObserver(function(pageNamesArrayValue) {
            _paramPageNames = [];

            for (var nameIndex in pageNamesArrayValue) {
                _paramPageNames.push(pageNamesArrayValue[nameIndex]);
            }
            _parameterPagesCount(_paramPageNames.length);

            recallParamPageForDevice();
        });

        cursorDevice.addNameObserver(40, 'unknown device', function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName);
            hasDeviceChanged = true;
        });

    }

});