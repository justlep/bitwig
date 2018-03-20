/**
 * Represents a ValueSet of sends (in form of StandardRangedValues) for the currently selected track.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.ValueSet}
 */
lep.SelectedTrackSendsValueSet = lep.util.extendClass(lep.ValueSet, {
    /**
     * @param {number} sendsPerPage
     * @constructs
     */
    _init: function(sendsPerPage) {
        var self = this,
            INSTANCE_NAME = 'SelectedTrackSends' + lep.SelectedTrackSendsValueSet._instances.push(this);

        lep.util.assertNumberInRange(sendsPerPage, 0, 50, 'Invalid sendsPerPage for {}', INSTANCE_NAME);

        var _trackView = new lep.SelectedTrackView({
                numSends: sendsPerPage
            }),
            _sendBank = _trackView.getCursorTrack().sendBank(),
            _scrollableView = new lep.ScrollableView(INSTANCE_NAME, sendsPerPage, _sendBank),
            _settableScrollPosition = _sendBank.scrollPosition(),
            _effectiveCurrentPage;

        this._super(INSTANCE_NAME, sendsPerPage, 1, function(sendIndex) {
            return new lep.StandardRangedValue({
                name: lep.util.formatString('{}-Send{}', this.name, sendIndex),
                rangedValue: _sendBank.getItemAt(sendIndex)
            });
        });

        _effectiveCurrentPage = this.currentPage; // do not move up since `currentPage` is set by super-call

        /**
         * @override
         */
        this.currentPage = ko.computed({
            read: _effectiveCurrentPage,
            write: function(uncheckedNewPageIndex) {
                var checkedNewPageIndex = lep.util.limitToRange(uncheckedNewPageIndex, 0, self.lastPage());
                lep.logDev('setSendsPage({}) for {}', checkedNewPageIndex, self.name);
                _settableScrollPosition.set(checkedNewPageIndex);
            }
        });

        this.lockedToTrack = _trackView.locked;

        this.lockedToTrack.subscribe(function(isLocked) {
            if (isLocked) {
                host.showPopupNotification('MultiSends locked to track ' + _trackView.trackName.peek());
            } else {
                host.showPopupNotification('MultiSends unlocked');
            }
        });

        this.gotoTrack = function() {
            _trackView.getCursorTrack().selectInEditor();
        };

        _scrollableView.currentPosition.subscribe(_effectiveCurrentPage);
        _scrollableView.totalItems.subscribe(function(total) {
            var lastPage = Math.max(0, total - 1);
            self.lastPage(lastPage);
        });
    },

    /**
     * @return {lep.KnockoutSyncedValue}
     */
    getDefaultPinnedToTrackKoSyncedValue: function() {
        var KEY = '__pttksv__';
        if (!this[KEY]) {
            this[KEY] = new lep.KnockoutSyncedValue({
                name: 'PinnedToDevice4' + this.name,
                ownValue: true,
                refObservable: this.lockedToDevice,
                onClick: this.lockedToDevice.toggle
            });
        }
        return this[KEY];
    }
});

/**
 * @type {lep.SelectedTrackSendsValueSet[]}
 * @static
 * @private
 */
lep.SelectedTrackSendsValueSet._instances = [];