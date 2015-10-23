/**
 * @constructor
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {

    _init: function(cursorDevice) {
        lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for ParamsValueSet');
        this._super('ParamsValueSet', 3, 8, function(groupIndex, paramIndex) {
            switch(groupIndex) {
                case 0: return lep.StandardRangedValue.createCommonParamValue(cursorDevice, paramIndex);
                case 1: return lep.StandardRangedValue.createEnvelopeParamValue(cursorDevice, paramIndex);
                case 2: return lep.StandardRangedValue.createParamValue(cursorDevice, paramIndex);
            }
        });

        var self = this,
            NUMBER_OF_FIX_PARAM_PAGES = 2,
            PARAMS_PER_PAGE = 8,
            _numberOfCustomParameterPages = ko.observable(0),
            _currentPage = ko.observable(0),
            _savedPageByDeviceName = {},
            _paramPageNames = ['Common', 'Envelope'],
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

        this.currentPage = ko.computed({
            read: _currentPage,
            write: function(proposedNewPage) {
                if (hasDeviceChanged) {
                    // If the device has changed, recallParamPageForDevice() is the only function allowed to
                    // set the new page, as it will be invoked LAST after lastPage() is determined, too
                    lep.logDebug('Skipped setting new page of ParamValueSet due to prior device change');
                    return;
                }
                var effectiveNewPage = lep.util.limitToRange(proposedNewPage, 0, self.lastPage()),
                    newCustomParameterPageIndex = (effectiveNewPage - NUMBER_OF_FIX_PARAM_PAGES),
                    newParameterPageName = _paramPageNames[effectiveNewPage];

                lep.logDebug('New page for {} -> proposed: {}, effective: {}', self.name, proposedNewPage, effectiveNewPage);
                if (newCustomParameterPageIndex >= 0) {
                    lep.logDebug('setParameterPage({})', newCustomParameterPageIndex);
                    cursorDevice.setParameterPage(newCustomParameterPageIndex);
                }
                _currentPage(effectiveNewPage);
                lep.logDebug('Selected parameter page: {}', newParameterPageName);
                popupNotification('Parameter Page: ' + newParameterPageName);
                saveParamPageForCurrentDevice();
            }
        });

        this.lastPage = ko.computed(function() {
            return _numberOfCustomParameterPages() + NUMBER_OF_FIX_PARAM_PAGES - 1;
        });
        this.lastPage.subscribe(function(newLastPage) {
            lep.logDebug('lastPage changed: {}, fixing old currentPage: {}', newLastPage, self.currentPage());
            if (newLastPage < self.currentPage()) {
                self.currentPage(newLastPage);
            }
        });

        this.currentPageValueOffset = ko.computed(function() {
            return lep.util.limitToRange(self.currentPage(), 0, NUMBER_OF_FIX_PARAM_PAGES) * PARAMS_PER_PAGE;
        });

        cursorDevice.addPageNamesObserver(function(/*...*/pageNames) {
            // (!) Bitwig Bug: API documentation says pageNames is an array, actual type is a rest-parameter of Strings
            var isPageNamesString = (arguments.length && typeof pageNames === 'string'),
                pageNamesCollection = !arguments.length ? [] : isPageNamesString ? arguments : pageNames;

            if (arguments.length && !isPageNamesString) {
                // TODO remove this once Bitwig has fixed the API or the documentation
                lep.logWarn('(!) API bug probably fixed for cursorDevice.addPageNamesObserver()');
            }

            for (var i = pageNamesCollection.length - 1, nameIndex; i >= 0; i--) {
                nameIndex = (NUMBER_OF_FIX_PARAM_PAGES + i);
                _paramPageNames[nameIndex] = pageNamesCollection[i];
            }

            _numberOfCustomParameterPages(arguments.length);
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