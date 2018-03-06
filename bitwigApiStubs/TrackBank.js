/* API Version - 2.3.1 */

/**
 * A track bank provides access to a range of tracks and their scenes (clip launcher slots) in Bitwig Studio.
 * Instances of track bank are configured with a fixed number of tracks and scenes and represent an excerpt of
 * a larger list of tracks and scenes. Various methods are provided for scrolling to different sections of the
 * track/scene list. It basically acts like a 2-dimensional window moving over the grid of tracks and scenes.
 * 
 * To receive an instance of track bank that supports all kinds of tracks call {@link ControllerHost#createTrackBank}.
 * Additional methods are provided in the {@link ControllerHost} interface to create track banks that include only main
 * tracks ({@link ControllerHost#createMainTrackBank}) or only effect tracks ({@link ControllerHost#createEffectTrackBank}).
 *
 * @see {@link ControllerHost#createTrackBank}
 * @see {@link ControllerHost#createMainTrackBank}
 * @see {@link ControllerHost#createEffectTrackBank}
 * @since API version 1
 */
function TrackBank() {}

TrackBank.prototype = new ChannelBank();
TrackBank.prototype.constructor = TrackBank;

/**
 * {@link SceneBank} that represents a view on the scenes in this {@link TrackBank}.
 *
 * @return {SceneBank}
 * @since API version 2
 */
TrackBank.prototype.sceneBank = function() {};

/**
 * Scrolls the scenes one page down.
 *
 * @since API version 1
 */
TrackBank.prototype.scrollScenesPageDown = function() {};

/**
 * Scrolls the scenes one step up.
 *
 * @since API version 1
 */
TrackBank.prototype.scrollScenesUp = function() {};

/**
 * Scrolls the scenes one step down.
 *
 * @since API version 1
 */
TrackBank.prototype.scrollScenesDown = function() {};

/**
 * Makes the scene with the given position visible in the track bank.
 *
 * @param position
          the position of the scene within the underlying full list of scenes
 * @since API version 1
 */
TrackBank.prototype.scrollToScene = function(position) {};

/**
 * Causes this bank to follow the supplied cursor. When the cursor moves to a new item the bank will be
 * scrolled so that the cursor is within the bank, if possible.
 *
 * @param cursorTrack
          The {@link CursorTrack} that this bank should follow.
 * @since API version 2
 */
TrackBank.prototype.followCursorTrack = function(cursorTrack) {};
