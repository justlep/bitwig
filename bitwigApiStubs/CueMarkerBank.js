/* API Version - 2.3.1 */

/**
 * A cue marker bank provides access to a range of cue markers in Bitwig Studio.
 * Instances are typically configured with a fixed number of markers and represent an excerpt
 * of a larger list of markers. It basically acts like a window moving over the list of markers.
 *
 * @since API version 2
 */
function CueMarkerBank() {}

CueMarkerBank.prototype = new Bank();
CueMarkerBank.prototype.constructor = CueMarkerBank;

/**
 * Scrolls the cue marker bank window so that the marker at the given position becomes visible.
 *
 * @param position
          the index of the marker within the underlying full list of markers (not the index within the
          bank). The position is typically directly related to the layout of the marker list in Bitwig
          Studio, starting with zero in case of the first marker.
 * @since API version 2
 */
CueMarkerBank.prototype.scrollToMarker = function(position) {};
