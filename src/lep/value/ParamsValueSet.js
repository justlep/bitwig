/**
 * Represents a ValueSet of parameters from the Device Panel Mappings.
 * (!) Compatible only with ControlSets of size 8 due to the Bitwig API implementation
 *
 * Use {@link ParamsValueSet} for ControlSets of different sizes instead.
 *
 * @constructor
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {

    _init: function(cursorDevice) {
        lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for ParamsValueSet');
        this._super('ParamsValueSet', 1, 8, function(paramIndex) {
            return lep.StandardRangedValue.createParamValue(cursorDevice, paramIndex);
        });

        var self = this,
            PARAMS_PER_PAGE = 8,
            _parameterPagesCount = ko.observable(0),
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
                var isValueSetActive = !!self.values[self.currentPageValueOffset()].controller;
                if (isValueSetActive) {
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
                cursorDevice.setParameterPage(newPageIndex);

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

        this.currentPageValueOffset = ko.computed(function() {
            return self.currentPage() * PARAMS_PER_PAGE;
        });

        cursorDevice.addPageNamesObserver(function(/*...*/pageNames) {
            // (!) Bitwig Bug: API documentation says pageNames is an array, actual type is a rest-parameter of Strings
            var isPageNamesString = (arguments.length && typeof pageNames === 'string'),
                pageNamesCollection = !arguments.length ? [] : isPageNamesString ? arguments : pageNames;

            if (arguments.length && !isPageNamesString) {
                // TODO remove this once Bitwig has fixed the API or the documentation
                lep.logWarn('(!) API bug probably fixed for cursorDevice.addPageNamesObserver()');
            }

            for (var nameIndex = pageNamesCollection.length - 1; nameIndex >= 0; nameIndex--) {
                _paramPageNames[nameIndex] = pageNamesCollection[nameIndex];
            }

            _parameterPagesCount(arguments.length);
            recallParamPageForDevice();
        });

        cursorDevice.addNameObserver(40, 'unknown device', function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName);
            hasDeviceChanged = true;
        });

        //cursorDevice.addSelectedPageObserver(-1, function(paramPage) {
        //    lep.logDebug('Selected paramsPage observer reports: {}', paramPage);
        //});
    }

});