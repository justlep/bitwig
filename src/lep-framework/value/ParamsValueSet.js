/**
 * Represents a ValueSet of parameters from the Device Pages.
 *
 * @constructor
 * @extends {lep.ValueSet}
 */
lep.ParamsValueSet = lep.util.extendClass(lep.ValueSet, {
    /**
     * @param {(CursorDevice|Device)} cursorDevice
     * @param {boolean} [followsSelectedPage=true] - if true, the ValueSet's current page follows the selection in the DAW
     * @constructs
     */
    _init: function(cursorDevice, followsSelectedPage) {
        lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for ParamsValueSet');

        const PARAMS_PER_PAGE = 8,
              INSTANCE_NAME = 'ParamsValueSet' + lep.ParamsValueSet.instances.push(this),
              self = this,
              remoteControlsPage = (followsSelectedPage !== false) ?
                  cursorDevice.createCursorRemoteControlsPage(PARAMS_PER_PAGE) :
                  cursorDevice.createCursorRemoteControlsPage(INSTANCE_NAME, PARAMS_PER_PAGE, '');

        this._super(INSTANCE_NAME, PARAMS_PER_PAGE, 1, function(paramIndex) {
            return lep.StandardRangedValue.createRemoteControlValue(remoteControlsPage, paramIndex);
        });

        var _effectiveCurrentPage = this.currentPage,
            _paramPageNames = [],
            popupNotification = function(message) {
                if (self.controlSet.peek()) {
                    host.showPopupNotification(message);
                }
            };

        this.deviceName = ko.observable('');

        /**
         * @override
         */
        this.currentPage = ko.computed({
            read: _effectiveCurrentPage,
            write: function(_newPageIndex) {
                var newPageIndex = lep.util.limitToRange(_newPageIndex, 0, self.lastPage());
                lep.logDev('setParameterPage({})', newPageIndex);
                remoteControlsPage.selectedPageIndex().set(newPageIndex);
            }
        });

        remoteControlsPage.selectedPageIndex().addValueObserver(function(newCurrentPage) {
            _effectiveCurrentPage(newCurrentPage);
            var newParameterPageName = _paramPageNames[newCurrentPage] || '-default-';
            lep.logDebug('Selected parameter page: {}', newParameterPageName);
            popupNotification('Parameter Page: ' + newParameterPageName);
        }, -1);

        remoteControlsPage.pageNames().addValueObserver(function(pageNamesArrayValue) {
            _paramPageNames = [];
            for (var nameIndex in pageNamesArrayValue) {
                _paramPageNames.push(pageNamesArrayValue[nameIndex]);
            }
            self.lastPage(_paramPageNames.length - 1);
        });

        cursorDevice.name().addValueObserver(function(deviceName) {
            lep.logDebug('Selected device: "{}"', deviceName);
            self.deviceName(deviceName || '_nodevname_');
        });
    }
});

/** @type {lep.ParamsValueSet[]} */
lep.ParamsValueSet.instances = [];