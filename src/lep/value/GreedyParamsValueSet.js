/**
 * @constructor
 */
lep.GreedyParamsValueSet = lep.util.extendClass(lep.ValueSet, {

    _init: function(primaryCursorDevice, paramPages) {
        lep.util.assertObject(primaryCursorDevice, 'Invalid primaryCursorDevice for GreedyParamsValueSet');
        lep.util.assertNumberInRange(paramPages, 1, 12, 'Invalid paramPages for GreedyParamsValueSet');

        var FIX_PARAM_PAGES_COUNT = 2,
            _cursorDevices = [primaryCursorDevice];

        this._super('ParamsValueSet', paramPages, 8, function(groupIndex, paramIndex) {
            switch(groupIndex) {
                case 0: return lep.StandardRangedValue.createCommonParamValue(primaryCursorDevice, paramIndex);
                case 1: return lep.StandardRangedValue.createEnvelopeParamValue(primaryCursorDevice, paramIndex);
                case 2: return lep.StandardRangedValue.createParamValue(primaryCursorDevice, paramIndex);
                default:
                    var additionalCursorIndex = (groupIndex - FIX_PARAM_PAGES_COUNT),
                        additionalCursorDevice = paramIndex ? _cursorDevices[additionalCursorIndex] : host.createEditorCursorDevice(),
                        paramPageIndex = (groupIndex - FIX_PARAM_PAGES_COUNT);

                    if (!paramIndex) {
                        _cursorDevices[additionalCursorIndex] = additionalCursorDevice;
                        additionalCursorDevice.addPageNamesObserver(function(/* unused names as arguments */) {
                            lep.logDev('additionalCursorDevice#{}.setParameterPage({})', additionalCursorIndex, paramPageIndex);
                            additionalCursorDevice.setParameterPage(paramPageIndex);
                        });
                    }
                    return lep.StandardRangedValue.createParamValue(additionalCursorDevice, paramIndex);
            }
        });
    }

    // TODO add page recall for previously selected devices

});