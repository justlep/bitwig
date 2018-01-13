/* API Version - 2.2.3 */

/**
 * Instances of this interface represent the cursor item of track selections.
 *
 * @since API version 1
 */
function CursorTrack() {}

CursorTrack.prototype = new CursorChannel();
CursorTrack.prototype.constructor = CursorTrack;

/**
 * Makes the cursor track point to it's parent group track, in case it is not already pointing to the root
 * group track.
 *
 * @since API version 1
 */
CursorTrack.prototype.selectParent = function() {};

/**
 * Makes the cursor track point to the first child found with the track group that this cursor currently
 * points to. If this cursor is not pointing to a track group or the track group is empty then this has no
 * effect.
 *
 * @since API version 2
 */
CursorTrack.prototype.selectFirstChild = function() {};

/**
 * Specifies the behaviour of the functions {@link #selectPrevious()}, {@link #selectNext()},
 * {@link #selectFirst()} and {@link #selectLast()}. Calling those functions can either navigate the cursor
 * within the current nesting level, or over a flat list of either all tracks or only the expanded tracks.
 * Default is CursorNavigationMode.FLAT.
 *
 * @param {CursorNavigationMode} mode
 * @since API version 1
 */
CursorTrack.prototype.setCursorNavigationMode = function(mode) {};

/**
 * @return {PinnableCursorDevice}
 */
CursorTrack.prototype.createCursorDevice = function() {};

/**
 * @param {string} name
 * @return {PinnableCursorDevice}
 */
CursorTrack.prototype.createCursorDevice = function(name) {};

/**
 * @param {string} name
 * @param {int} numSends
 * @return {PinnableCursorDevice}
 */
CursorTrack.prototype.createCursorDevice = function(name, numSends) {};

/**
 * Creates a {@link CursorDevice} for this cursor track that by default follows a device based on the
 * supplied follow mode.
 *
 * @param id
          An id that is used to identify this cursor.
 * @param name
          A name that is displayed to the user for this cursor.
 * @param numSends
          the number of sends that are simultaneously accessible in nested channels.
 * @param followMode
          Mode that defines how this cursor should follow devices.
 * @return {PinnableCursorDevice}
 * @since API version 2
 */
CursorTrack.prototype.createCursorDevice = function(id, name, numSends, followMode) {};
