/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ChannelSelectValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assert(opts.channel, 'Missing channel for {}', opts.name);

        var self = this;

        this.channel = opts.channel;
        this.toggleOnPressed = (opts.toggleOnPressed !== false);

        this.channel.addIsSelectedObserver(function(isSelected) {
            self.value = isSelected ? self.velocityValueOn : self.velocityValueOff;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        if (this.toggleOnPressed ^ !!absoluteValue) return;
        this.channel.select();
    },

    velocityValueOn: 127,
    velocityValueOff: 0
});

/** @static */
lep.ChannelSelectValue.setVelocityValues = function(onValue, offValue) {
    lep.util.assertNumberInRange(onValue, 0, 127, 'Invalid onValue {} for ChannelSelectValue.setVelocityValues', onValue);
    lep.util.assertNumberInRange(offValue, 0, 127, 'Invalid offValue {} for ChannelSelectValue.setVelocityValues', offValue);
    lep.util.extend(lep.ChannelSelectValue.prototype, {
        velocityValueOn: onValue,
        velocityValueOff: offValue
    });
};

/** @static */
lep.ChannelSelectValue.create = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ChannelSelectValue.create');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ChannelSelectValue.create');
    return new lep.ChannelSelectValue({
        name: lep.util.formatString('Select{}', channelIndex),
        channel: channelBank.getChannel(channelIndex)
    });
};