/* API Version - 2.2 */

function NotePlaybackCallback() {}

NotePlaybackCallback.prototype = new Callback();
NotePlaybackCallback.prototype.constructor = NotePlaybackCallback;

/**
 * @param {boolean} isNoteOn
 * @param {int} key
 * @param {float} velocity
 */
NotePlaybackCallback.prototype.notePlaybackEventOccurred = function(isNoteOn, key, velocity) {};
