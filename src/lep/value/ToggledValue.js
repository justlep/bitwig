/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.ToggledValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assertObject(opts.togglableValue, 'Missing togglableValue for {}', opts.name);
        lep.util.assertFunction(opts.togglableValue.toggle, 'Invalid togglableValue for {}', opts.name);

        var self = this;

        this.setInstanceVelocityValues(opts.velocityValueOn, opts.velocityValueOff);

        this.togglableValue = opts.togglableValue;
        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.prefs = opts.prefs;

        this.togglableValue.addValueObserver(function(on) {
            self.value = on ? self.velocityValueOn : self.velocityValueOff;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        var isPressed = !!absoluteValue;
        if (this.toggleOnPressed === isPressed) {
            if (this.prefs && (typeof this.prefs.soloExclusive !== 'undefined')) {
                this.togglableValue.toggle(!!this.prefs.soloExclusive);
            } else {
                this.togglableValue.toggle();
            }
        }
    },
    setInstanceVelocityValues: function(onValueOrEmpty, offValueOrEmpty) {
        lep.util.assertNumberInRangeOrEmpty(onValueOrEmpty, 0, 127, 'Invalid onValueOrEmpty {} for {}', onValueOrEmpty, this.name);
        lep.util.assertNumberInRangeOrEmpty(offValueOrEmpty, 0, 127, 'Invalid offValueOrEmpty {} for {}', offValueOrEmpty, this.name);
        this.velocityValueOn = (typeof onValueOrEmpty === 'number') ? onValueOrEmpty : lep.ToggledValue.VELOCITY_VALUES.DEFAULT_ON;
        this.velocityValueOff = (typeof offValueOrEmpty === 'number') ? offValueOrEmpty : lep.ToggledValue.VELOCITY_VALUES.DEFAULT_OFF;
    }
});

/** @static */
lep.ToggledValue.VELOCITY_VALUES = {
    DEFAULT_ON: 127,
    DEFAULT_OFF: 0,
    ARM_ON: 127,
    ARM_OFF: 0,
    MUTE_ON: 127,
    MUTE_OFF: 0,
    SOLO_ON: 127,
    SOLO_OFF: 0
};

/** @static */
lep.ToggledValue.setArmVelocityValues = function(onValue, offValue) {
    lep.util.extend(lep.ToggledValue.VELOCITY_VALUES, {
        ARM_ON: onValue,
        ARM_OFF: offValue
    });
};
/** @static */
lep.ToggledValue.setMuteVelocityValues = function(onValue, offValue) {
    lep.util.extend(lep.ToggledValue.VELOCITY_VALUES, {
        MUTE_ON: onValue,
        MUTE_OFF: offValue
    });
};
/** @static */
lep.ToggledValue.setSoloVelocityValues = function(onValue, offValue) {
    lep.util.extend(lep.ToggledValue.VELOCITY_VALUES, {
        SOLO_ON: onValue,
        SOLO_OFF: offValue
    });
};

/** @static */
lep.ToggledValue.createArmValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ToggledValue.createArmValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ToggledValue.createArmValue');
    return new lep.ToggledValue({
        name: lep.util.formatString('Arm{}', channelIndex),
        togglableValue: channelBank.getChannel(channelIndex).getArm(),
        velocityValueOn: lep.ToggledValue.VELOCITY_VALUES.ARM_ON,
        velocityValueOff: lep.ToggledValue.VELOCITY_VALUES.ARM_OFF
    });
};

/** @static */
lep.ToggledValue.createMuteValue = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ToggledValue.createMuteValue');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ToggledValue.createMuteValue');
    return new lep.ToggledValue({
        name: lep.util.formatString('Mute{}', channelIndex),
        togglableValue: channelBank.getChannel(channelIndex).getMute(),
        velocityValueOn: lep.ToggledValue.VELOCITY_VALUES.MUTE_ON,
        velocityValueOff: lep.ToggledValue.VELOCITY_VALUES.MUTE_OFF
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
        prefs: prefs,
        velocityValueOn: lep.ToggledValue.VELOCITY_VALUES.SOLO_ON,
        velocityValueOff: lep.ToggledValue.VELOCITY_VALUES.SOLO_OFF
    });
};