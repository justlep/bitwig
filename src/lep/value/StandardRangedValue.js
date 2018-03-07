/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseValue}
 */
lep.StandardRangedValue = lep.util.extendClass(lep.BaseValue, {

    /**
     * @param {Object} opts
     * @param {string} opts.name
     * @param {RangedValue} opts.rangedValue
     * @param {?RangedValue} [opts.indicateableValue] - defaults to opts.rangedValue
     * @param {?boolean} [opts.isTakeoverEnabled]
     * @constructs
     */
    _init: function(opts) {
        this._super(opts);

        var self = this;

        lep.util.assertObject(opts.rangedValue, 'Missing rangedValue for {}', opts.name);
        this.rangedValue = opts.rangedValue;
        this.indicateableValue = opts.indicateableValue || opts.rangedValue;
        lep.util.assertFunction(this.indicateableValue.setIndication, 'Invalid indicateableValue for {}', this.name);

        this._takeover = null;
        this.setTakeoverEnabled(opts.isTakeoverEnabled);

        this.rangedValue.addValueObserver(128, function(newValue) {
            // lep.logDebug('{} -> rangedValue observer fired with newValue: {}', self.name, newValue);
            self.value = newValue;

            var takeover = self._takeover;
            if (takeover) {
                if (takeover.isSynced && takeover.recentSyncedValues[newValue]) {
                    takeover.recentSyncedValues[newValue] = 0;
                } else {
                    // lep.logDebug('{} -> went OFF SYNC -> newValue: {}', self.name, newValue);
                    takeover.isSynced = null;
                    takeover.recentSyncedValues = {};
                }
            }
            self.syncToController();
        });

        lep.StandardRangedValue._instances.push(this);
    },

    /**
     * Set the value of this SRV manually (i.e. programmatically instead of MIDI-value-received or observer event)
     */
    setValue: function(value, optionalRange) {
        this.rangedValue.set(value, optionalRange || 128);
    },
    setTakeoverEnabled: function(isEnabled) {
        this._takeover = isEnabled ? (this._takeover || {
            isSynced: null, // null := not synced && no takeover range defined;  false := not synced, but range defined
            minValue: null,
            maxValue: null,
            recentSyncedValues: {},
            requiresMoveUp: false
        }) : null;
    },
    /** @override */
    afterDetach: function() {
        var takeover = this._takeover;
        if (takeover) {
            takeover.isSynced = null;
            takeover.recentSyncedValues = {};
        }
    },
    /** @override */
    setIndication: function(on) {
        // lep.logDebug('setIndications({}) for {}', on, this.name);
        this.indicateableValue.setIndication(on);
    },
    /** @override */
    onRelativeValueReceived: function(delta, range) {
        if (this._takeover) {
            this.setTakeoverEnabled(false);
        }
        this.rangedValue.inc(delta, range);
    },
    /** @override */
    onAbsoluteValueReceived: function(absoluteValue, isTakeoverAdvised) {
        // lep.logDebug('{} -> onAbsoluteValueReceived({}, {})', this.name, absoluteValue, isTakeoverAdvised);
        var takeover = this._takeover;

        if (takeover && isTakeoverAdvised) {
            if (!takeover.isSynced) {
                if (takeover.isSynced === null) {
                    takeover.requiresMoveUp = (absoluteValue < this.value);
                    if (takeover.requiresMoveUp) {
                        takeover.minValue = this.value;
                        takeover.maxValue = 127;
                    } else {
                        takeover.minValue = 0;
                        takeover.maxValue = this.value;
                    }
                }
                takeover.isSynced = (absoluteValue >= takeover.minValue) && (absoluteValue <= takeover.maxValue);
                if (!takeover.isSynced) {
                    host.showPopupNotification(takeover.requiresMoveUp ?
                        '↑↑ Takeover ' + (((this.value - absoluteValue) * 100 / 127) >> 0) + '% ↑↑' :
                        '↓↓ Takeover ' + (((absoluteValue - this.value) * 100 / 127) >> 0) + '% ↓↓'
                    );
                    // lep.logDebug('{} -> rejected takeover: {} <> [{}-{}]', this.name, absoluteValue, takeover.minValue, takeover.maxValue);
                    return;
                }
                // lep.logDebug('{} -> takeover SUCCESS', this.name);
            }
            takeover.recentSyncedValues[absoluteValue] = 1;
        }
        this.rangedValue.set(absoluteValue, 128);
    }
});

/** @type {lep.StandardRangedValue[]} */
lep.StandardRangedValue._instances = [];

/** @static */
lep.StandardRangedValue.globalTakeoverEnabled = (function(_enabledObs, _allInstances) {
    return ko.computed({
        read: _enabledObs,
        write: function(newIsEnabled) {
            for (var i = _allInstances.length - 1; i >= 0; i--) {
                _allInstances[i].setTakeoverEnabled(newIsEnabled);
            }
            _enabledObs(newIsEnabled);
            host.showPopupNotification('Takeover ' + (newIsEnabled ? 'enabled' : 'disabled'));
        }
    }).extend({toggleable: true});
})(ko.observable(false), lep.StandardRangedValue._instances);


/**
 * @param {ChannelBank} channelBank
 * @param {number} channelIndex
 * @return {lep.StandardRangedValue}
 * @static
 */
lep.StandardRangedValue.createVolumeValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for StandardRangedValue.createVolumeValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for StandardRangedValue.createVolumeValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Vol{}', channelIndex),
        rangedValue: channelBank.getItemAt(channelIndex).volume()
    });
};

/**
 * @param channelBank {ChannelBank}
 * @param channelIndex {number}
 * @return {lep.StandardRangedValue}
 * @static
 */
lep.StandardRangedValue.createPanValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for StandardRangedValue.createPanValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for StandardRangedValue.createPanValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Pan{}', channelIndex),
        rangedValue: channelBank.getItemAt(channelIndex).pan()
    });
};

/**
 * @deprecated
 * @static
 **/
lep.StandardRangedValue.createParamValue = function(cursorDevice, paramIndex) {
    lep.util.assertObject(cursorDevice, 'Invalid cursorDevice for StandardRangedValue.createParamValue');
    lep.util.assertNumber(paramIndex, 'Invalid paramIndex for StandardRangedValue.createParamValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Param{}', paramIndex),
        rangedValue: cursorDevice.getParameter(paramIndex)
    });
};

/**
 * @param {RemoteControlsPage} remoteControlsPage
 * @param {number} paramIndex
 * @return {lep.StandardRangedValue}
 * @static
 */
lep.StandardRangedValue.createRemoteControlValue = function(remoteControlsPage, paramIndex) {
    lep.util.assertObject(remoteControlsPage, 'Invalid remoteControlsPage for StandardRangedValue.createRemoteControlValue');
    lep.util.assertNumber(paramIndex, 'Invalid paramIndex for StandardRangedValue.createRemoteControlValue');
    return new lep.StandardRangedValue({
        name: lep.util.formatString('Param{}', paramIndex),
        rangedValue: remoteControlsPage.getParameter(paramIndex)
    });
};

/**
 * TODO: in Bitwig 2 these values do show NO indication marker + do not get any feedback from the daw
 * @param {UserControlBank} userControlBank
 * @param {number} controlIndex
 * @param {string} label
 * @return {lep.StandardRangedValue}
 * @static
 */
lep.StandardRangedValue.createUserControlValue = function(userControlBank, controlIndex, label) {
    lep.util.assertObject(userControlBank, 'Invalid userControlBank for StandardRangedValue.createUserControlValue');
    lep.util.assertNumberInRange(controlIndex, 0, 127, 'Invalid controlIndex for StandardRangedValue.createUserControlValue');
    lep.util.assertString(label, 'Invalid label for StandardRangedValue.createUserControlValue');

    var userControl = userControlBank.getControl(controlIndex);
    userControl.setLabel(label);

    return new lep.StandardRangedValue({
        name: label,
        rangedValue: userControl.value(),
        indicateableValue: userControl
    });
};
