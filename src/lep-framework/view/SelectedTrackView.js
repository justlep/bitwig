/**
 * Represents a knockout-enhanced view on the selected track
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
        _numScenes = _opts.numScenes || 0;

    lep.util.assertNumberInRange(_numSends, 0, 50, 'Invalid numSends for {}: {}', this.name, _numSends);
    lep.util.assertNumberInRange(_numScenes, 0, 50, 'Invalid numScenes for {}: {}', this.name, _numScenes);

    var _cursorTrack = host.createCursorTrack(_numSends, _numScenes),
        _settableIsPinned = _cursorTrack.isPinned();

    this.locked = ko.computed({
        read: ko.observable(false).updatedByBitwigValue(_settableIsPinned),
        write: function(doLock) {
            _settableIsPinned.set(!!doLock);
        }
    }).extend({toggleable: true});

    this.getCursorTrack = function() {
        return _cursorTrack;
    };

    this.trackName = ko.observable().updatedByBitwigValue(_cursorTrack.name());
};

/**
 * @type {lep.SelectedTrackView[]}
 * @private
 */
lep.SelectedTrackView._instances = [];