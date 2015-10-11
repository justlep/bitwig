/**
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.ChannelSelectValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assert(opts.channel, 'Missing channel for ' + opts.name);

        var self = this;

        this.channel = opts.channel;
        this.toggleOnPressed = (opts.toggleOnPressed !== false);

        this.channel.addIsSelectedObserver(function(isSelected) {
            self.value = isSelected ? 127 : 0;
            self.syncToController();
        });
    },
    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        if (this.toggleOnPressed ^ !!absoluteValue) return;
        this.channel.select();
    }
});

/** @static */
lep.ChannelSelectValue.create = function(channelBank, channelIndex) {
    lep.util.assertObject(channelBank, 'Invalid channelBank for lep.ChannelSelectValue.create');
    lep.util.assertNumber(channelIndex, 'Invalid channelIndex for lep.ChannelSelectValue.create');
    return new lep.ChannelSelectValue({
        name: lep.util.formatString('Select{}', channelIndex),
        channel: channelBank.getChannel(channelIndex)
    });
};