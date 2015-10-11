/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ToggledValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assert(!!opts.togglableValue, 'Missing togglableValue for ' + opts.name);

        var self = this;

        this.togglableValue = opts.togglableValue;
        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.prefs = opts.prefs;

        this.togglableValue.addValueObserver(function(on) {
            self.value = on ? 127 : 0;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        if (this.toggleOnPressed ^ !!absoluteValue) return;
        if (this.prefs && (typeof this.prefs.soloExclusive !== 'undefined')) {
            this.togglableValue.toggle(!!this.prefs.soloExclusive);
        } else {
            this.togglableValue.toggle();
        }
    }
});

/** @static */
lep.ToggledValue.createArmValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ToggledValue.createArmValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ToggledValue.createArmValue');
    return new lep.ToggledValue({
        name: lep.util.formatString('Arm{}', channelIndex),
        togglableValue: channelBank.getChannel(channelIndex).getArm()
    });
};

/** @static */
lep.ToggledValue.createMuteValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ToggledValue.createMuteValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ToggledValue.createMuteValue');
    return new lep.ToggledValue({
        name: lep.util.formatString('Mute{}', channelIndex),
        togglableValue: channelBank.getChannel(channelIndex).getMute()
    });
};

/** @static */
lep.ToggledValue.createSoloValue = function(channelBank, channelIndex, prefs) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ToggledValue.createSoloValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ToggledValue.createSoloValue');
    lep.util.assertObject(prefs, 'Missing prefs object for ToggledValue.createSoloValue');
    lep.util.assertBoolean(prefs.soloExclusive, 'Missing prefs.soloExclusive for lep.ToggledValue.createSoloValue');
    return new lep.ToggledValue({
        name: lep.util.formatString('Solo{}', channelIndex),
        togglableValue: channelBank.getChannel(channelIndex).getSolo(),
        prefs: prefs
    });
};