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
            _paramPageNames = ['Common', 'Envelope'];

        this.deviceName = ko.observable('');

        this.currentPage = ko.computed({
            read: _currentPage,
            write: function(proposedNewPage) {
                var effectiveNewPage = lep.util.limitToRange(proposedNewPage, 0, self.lastPage());
                lep.logDebug('New page for {} -> proposed: {}, effective: {}', self.name, proposedNewPage, effectiveNewPage);
                if (proposedNewPage >= NUMBER_OF_FIX_PARAM_PAGES) {
                    cursorDevice.setParameterPage(proposedNewPage - NUMBER_OF_FIX_PARAM_PAGES);
                }
                _currentPage(effectiveNewPage);
            }
        });

        this.lastPage = ko.computed(function() {
            return _numberOfCustomParameterPages() + NUMBER_OF_FIX_PARAM_PAGES - 1;
        });
        this.lastPage.subscribe(function(newLastPage) {
            if (newLastPage < self.currentPage()) {
                self.currentPage(newLastPage);
            }
        });

        this.currentPageValueOffset = ko.computed(function() {
            return lep.util.limitToRange(self.currentPage(), 0, NUMBER_OF_FIX_PARAM_PAGES) * PARAMS_PER_PAGE;
        });

        cursorDevice.addPageNamesObserver(function(/*...*/pageNames) {
            // The API doc seems to have a mistake here - parameter is NOT an array but a rest-parameter of x Strings
            lep.util.assertStringOrEmpty(pageNames, 'Possible API change for cursorDevice.addPageNamesObserver');
                  lep.logDebug('New number of custom param pages: {}', arguments.length);
            //for (var i = 0, nameIndex, name; i<arguments.length; i++) {
            //    name = arguments[i];
            //    nameIndex = i + NUMBER_OF_FIX_PARAM_PAGES;
            //    _paramPageNames[nameIndex] = name;
            //    lep.logDebug('ParamPage {} = "{}"', i, name);
            //}
            _numberOfCustomParameterPages(arguments.length);
        });
        cursorDevice.addNameObserver(40, 'unknown device', function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName);
        });
        cursorDevice.addSelectedPageObserver(-1, function(paramPage) {
            // Probably a Bitwig bug: -1 will never occurr (Bitwig 1.2)
            if (paramPage >= 0) {
                lep.logDebug('Selected params page change reported by observer: {}', paramPage);
                self.currentPage(NUMBER_OF_FIX_PARAM_PAGES + paramPage);
            } else {
                lep.logDebug('No page selected');
            }
        });
    }

});