/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseValue}
 */
lep.ChannelSelectValue = lep.util.extendClass(lep.BaseValue, {
    _init: function(opts) {
        this._super(opts);

        lep.util.assertObject(opts.channel, 'Invalid channel {} for {}', opts.channel, opts.name);

        var self = this;

        this.channel = opts.channel;
        this.toggleOnPressed = (opts.toggleOnPressed !== false);

        this.channel.addIsSelectedInEditorObserver(function(isSelected) {
            self.value = isSelected ? self.velocityValueOn : self.velocityValueOff;
            self.syncToController();
        });
    },
    /** @override */
    onAbsoluteValueReceived: function(absoluteValue /*, isTakeoverRequired */) {
        var isPressed = !!absoluteValue;
        if (this.toggleOnPressed === isPressed) {
            this.channel.selectInMixer();
        }
    },

    velocityValueOn: 127,
    velocityValueOff: 0
});

/**
 * @param {number} onValue
 * @param {number} offValue
 */
lep.ChannelSelectValue.setVelocityValues = function(onValue, offValue) {
    lep.util.assertNumberInRange(onValue, 0, 127, 'Invalid onValue {} for ChannelSelectValue.setVelocityValues', onValue);
    lep.util.assertNumberInRange(offValue, 0, 127, 'Invalid offValue {} for ChannelSelectValue.setVelocityValues', offValue);
    lep.util.extend(lep.ChannelSelectValue.prototype, {
        velocityValueOn: onValue,
        velocityValueOff: offValue
    });
};

/**
 * @param {ChannelBank} channelBank
 * @param {number} channelIndex
 * @return {lep.ChannelSelectValue}
 * @static
 */
lep.ChannelSelectValue.create = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ChannelSelectValue.create');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ChannelSelectValue.create');
    return new lep.ChannelSelectValue({
        name: lep.util.formatString('Select{}', channelIndex),
        channel: channelBank.getItemAt(channelIndex)
    });
};