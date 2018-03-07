/**
 * A Knockout-enhanced view class for simple, unified handling of {@link Scrollable} instances.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {string} ownerName - name of the object this instance is created by/for
 * @param {number} scrolledWindowSize - how many items are in one page
 * @param {Scrollable} scrollable
 * @constructor
 */
lep.ScrollableView = function(ownerName, scrolledWindowSize, scrollable) {
    lep.util.assertNonEmptyString(ownerName, 'Invalid ownerName for ScrollableView: {}', ownerName);
    lep.util.assertNumberInRange(scrolledWindowSize, 1, 100000, 'Invalid scrolledWindowSize for ScrollableView of {}', scrolledWindowSize);
    lep.util.assertFunction(scrollable && scrollable.scrollPosition , 'Invalid scrollable for ScrollableView of {}', ownerName);

    var self = this,
        _name = 'ScrollableView[' + ownerName +']',
        _settableScrollPosition = scrollable.scrollPosition(),
        /**
         * Scroll the bank forth or back while keeping it in valid bounds
         * @param {number} relScrollSize
         * @private
         */
        _scrollBy = function(relScrollSize) {
            var safeNewPos = Math.max(0, Math.min(self.currentPosition() + relScrollSize, self.totalItems() - scrolledWindowSize));
            // lep.logDev('safeNewPos for TrackWindow = ' + safeNewPos);
            _settableScrollPosition.set(safeNewPos);
        };

    this.currentPosition = ko.observable(0).updatedByBitwigValue(_settableScrollPosition);
    this.totalItems = ko.observable(0).updatedByBitwigValue(scrollable.itemCount());

    this.scrollSize = (function(_obs) {
        return ko.computed({
            read: _obs,
            write: function(newScrollSize) {
                lep.util.assertNumberInRange(newScrollSize, 1, scrolledWindowSize, 'Invalid new scrollSize "{}" for {}', newScrollSize, _name);
                _obs(newScrollSize);
            }
        });
    })(ko.observable(1));

    this.canMoveBack = ko.observable(false).updatedByBitwigValue(scrollable.canScrollBackwards());
    this.canMoveForth = ko.observable(false).updatedByBitwigValue(scrollable.canScrollForwards());

    this.moveForth = function() {
        _scrollBy(self.scrollSize());
    };
    this.movePageForth = function() {
        _scrollBy(scrolledWindowSize);
    };
    this.moveBack = function() {
        _scrollBy(-self.scrollSize());
    };
    this.movePageBack = function() {
        _scrollBy(-scrolledWindowSize);
    };
};