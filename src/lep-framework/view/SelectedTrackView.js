/**
 * Represents a knockout-enhanced view on the selected track
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.SelectedTrackView = function() {
    this.name = 'SelectedTrackView' + lep.SelectedTrackView._instances.push(this);

    var _cursorTrack = host.createCursorTrack(0, 0),
        _settableIsPinned = _cursorTrack.isPinned();

    this.locked = ko.computed({
        read: ko.observable(false).updatedByBitwigValue(_settableIsPinned),
        write: function(doLock) {
            _settableIsPinned.set(!!doLock);
        }
    });

    this.getCursorTrack = function() {
        return _cursorTrack;
    };
};

lep.SelectedTrackView._instances = [];