/**
 * Represents a knockout-enhanced view on the currently selected track.
 * Multiple instances can be locked to different tracks independent from each other.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {Object} [opts]
 * @param {number} [opts.numSends=0]
 * @param {number} [opts.numScenes=0]
 *
 * @constructor
 */
lep.SelectedTrackView = function(opts) {
    this.name = 'SelectedTrackView' + lep.SelectedTrackView._instances.push(this);

    var _opts = opts || {},
        _numSends = _opts.numSends || 0,
        _numScenes = _opts.numScenes || 0,
        _id = this.name;

    lep.util.assertNumberInRange(_numSends, 0, 50, 'Invalid numSends for {}: {}', this.name, _numSends);
    lep.util.assertNumberInRange(_numScenes, 0, 50, 'Invalid numScenes for {}: {}', this.name, _numScenes);

    if (!lep.SelectedTrackView._autoFollowingCursorTrack) {
        lep.SelectedTrackView._autoFollowingCursorTrack = host.createCursorTrack(0, 0);
    }

    var _cursorTrack = host.createCursorTrack(_id, this.name, _numSends, _numScenes, false),
        _settableIsPinned = _cursorTrack.isPinned(),
        _syncChannel = function() {
            _cursorTrack.selectChannel(lep.SelectedTrackView._autoFollowingCursorTrack);
        },
        _syncOrNOP = _syncChannel;

    lep.SelectedTrackView._autoFollowingCursorTrack.name().addValueObserver(function(trackName) {
        // lep.logWarn('Track of {} is now {}', self.name, trackName);
        _syncOrNOP();
    });

    this.locked = ko.computed({
        read: ko.observable(false).updatedByBitwigValue(_settableIsPinned),
        write: function(doLock) {
            _syncOrNOP = doLock ? lep.util.NOP : _syncChannel;
            _settableIsPinned.set(!!doLock);
        }
    }).extend({toggleable: true});

    this.getCursorTrack = function() {
        return _cursorTrack;
    };

    this.trackName = ko.observable().updatedByBitwigValue(_cursorTrack.name());

    // initially, unlock this instance from any track
    host.scheduleTask(this.locked.toggleOff, 200);
};

/**
 * The CursorTrack which auto-follows the selected channel in Bitwig;
 * Created lazily by the first instance of SelectedTrackView, then reused & shared by all instances
 * @type {CursorTrack}
 * @private
 * @static
 */
lep.SelectedTrackView._autoFollowingCursorTrack = null;

/**
 * @type {lep.SelectedTrackView[]}
 * @private
 */
lep.SelectedTrackView._instances = [];