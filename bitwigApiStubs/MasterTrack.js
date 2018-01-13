/* API Version - 2.2.3 */

/**
 * A special kind of track that represents the master track in Bitwig Studio.
 *
 * @since API version 1
 */
function MasterTrack() {}

MasterTrack.prototype = new Track();
MasterTrack.prototype.constructor = MasterTrack;
