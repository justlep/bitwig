/**
 * Represents a ValueSet of parameters from the Device Panel Mappings.
 * Unlike {@link ParamsValueSet}, this valueset is compatible with ControlSets of *any* size,
 * and ALL (fix and non-fixed) parameter pages are accessible simultaneously
 * (by using multiple CursorDevices instead only the given primary one).
 *
 * For script with ControlSets of size 8 only and no {@link Morpher} being used,
 * it is sufficient to use {@link ParamsValueSet} instead.
 *
 * @constructor
 */
lep.GreedyParamsValueSet = lep.util.extendClass(lep.ValueSet, {

    _init: function(primaryCursorDevice, paramPages) {
        lep.util.assertObject(primaryCursorDevice, 'Invalid primaryCursorDevice for GreedyParamsValueSet');
        lep.util.assertNumberInRange(paramPages, 1, 12, 'Invalid paramPages for GreedyParamsValueSet');

        var FIX_PARAM_PAGES_COUNT = 2,
            PARAMS_PER_PAGE = 8,
            _cursorDevices = [primaryCursorDevice],
            _paramPageNames = [],
            _numberOfCustomParameterPages = ko.observable(0),
            self = this;

        this.deviceName = ko.observable();

        /** @Override */
        this.dynamicId = ko.computed(function() {
            return '' + self.id + '_' + self.name + '__' + self.deviceName();
        });

        primaryCursorDevice.addNameObserver(50, 'unknown device', function(deviceName) {
            self.deviceName(deviceName);
        });

        /**
         * 0-based index of the last param page with defined mappings.
         **/
        this.lastPage = ko.computed(function() {
            return FIX_PARAM_PAGES_COUNT + _numberOfCustomParameterPages() - 1;
        });

        /**
         * Index of the last value that should be included in morphing calculations.
         */
        this.lastValidValueIndex = ko.computed(function() {
            return (self.lastPage() + 1) *  PARAMS_PER_PAGE - 1;
        });

        this._super('GreedyParamsValueSet', paramPages, PARAMS_PER_PAGE, function(groupIndex, paramIndex) {
            switch(groupIndex) {
                case 0: return lep.StandardRangedValue.createCommonParamValue(primaryCursorDevice, paramIndex);
                case 1: return lep.StandardRangedValue.createEnvelopeParamValue(primaryCursorDevice, paramIndex);
                case 2: return lep.StandardRangedValue.createParamValue(primaryCursorDevice, paramIndex);
                default:
                    var additionalCursorIndex = (groupIndex - FIX_PARAM_PAGES_COUNT),
                        isFirstParamOfGroup = !paramIndex,
                        paramPageIndex = (groupIndex - FIX_PARAM_PAGES_COUNT),
                        groupCursorDevice;

                    if (isFirstParamOfGroup) {
                        groupCursorDevice = host.createEditorCursorDevice();
                        _cursorDevices[additionalCursorIndex] = groupCursorDevice;
                        groupCursorDevice.addPageNamesObserver(function(/* unused names as arguments */) {
                            var numberOfPages = arguments.length;

                            // for (var i=0; i<numberOfPages; i++) {
                            //     lep.logDev('cursor[{}], page[{}]={}', additionalCursorIndex, i, arguments[i]);
                            // }

                            if (paramPageIndex < numberOfPages) {
                                lep.logDebug('_cursorDevices[{}].setParameterPage({})', additionalCursorIndex, paramPageIndex);
                                groupCursorDevice.setParameterPage(paramPageIndex);
                            } else {
                                lep.logDebug('Skip _cursorDevices[{}].setParameterPage({}) -> only {} pages defined',
                                            additionalCursorIndex, paramPageIndex, numberOfPages);
                            }
                        });
                    } else {
                        groupCursorDevice = _cursorDevices[additionalCursorIndex];
                    }

                    return lep.StandardRangedValue.createParamValue(groupCursorDevice, paramIndex);
            }
        });

        primaryCursorDevice.addPageNamesObserver(function(/*...*/pageNames) {
            // (!) Bitwig Bug: API documentation says pageNames is an array, actual type is a rest-parameter of Strings
            var isPageNamesString = (arguments.length && typeof pageNames === 'string'),
                pageNamesCollection = !arguments.length ? [] : isPageNamesString ? arguments : pageNames;

            if (arguments.length && !isPageNamesString) {
                // TODO remove this once Bitwig has fixed the API or the documentation
                lep.logWarn('(!) API bug probably fixed for cursorDevice.addPageNamesObserver()');
            }

            for (var i = pageNamesCollection.length - 1, nameIndex; i >= 0; i--) {
                nameIndex = (FIX_PARAM_PAGES_COUNT + i);
                _paramPageNames[nameIndex] = pageNamesCollection[i];
            }

            lep.logDebug('(Non-fixed) Param pages: {}', arguments.length);

            _numberOfCustomParameterPages(arguments.length);
        });

    }

});