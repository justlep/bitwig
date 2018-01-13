/* API Version - 2.2.3 */

/**
 * Instances of this interface represent tracks in Bitwig Studio.
 *
 * @since API version 1
 */
function Track() {}

Track.prototype = new Channel();
Track.prototype.constructor = Track;

/**
 * Value that reports the position of the track within the list of Bitwig Studio tracks.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
Track.prototype.position = function() {};

/**
 * Returns an object that can be used to access the clip launcher slots of the track.
 *
 * @return {ClipLauncherSlotBank} an object that represents the clip launcher slots of the track
 * @since API version 2
 */
Track.prototype.clipLauncherSlotBank = function() {};

/**
 * Returns an object that provides access to the arm state of the track.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
Track.prototype.getArm = function() {};

/**
 * Returns an object that provides access to the monitoring state of the track.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
Track.prototype.getMonitor = function() {};

/**
 * Returns an object that provides access to the auto-monitoring state of the track.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
Track.prototype.getAutoMonitor = function() {};

/**
 * Returns an object that provides access to the cross-fade mode of the track.
 *
 * @return {SettableEnumValue} an enum value object that has three possible states: "A", "B", or "AB"
 * @since API version 1
 */
Track.prototype.getCrossFadeMode = function() {};

/**
 * Value that reports if this track is currently stopped. When a track is stopped it is not playing content
 * from the arranger or clip launcher.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Track.prototype.isStopped = function() {};

/**
 * Value that reports if the clip launcher slots are queued for stop.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Track.prototype.isQueuedForStop = function() {};

/**
 * Returns the source selector for the track, which is shown in the IO section of the track in Bitwig
 * Studio and lists either note or audio sources or both depending on the track type.
 *
 * @return {SourceSelector} a source selector object
 * @since API version 1
 */
Track.prototype.getSourceSelector = function() {};

/**
 * Stops playback of the track.
 *
 * @since API version 1
 */
Track.prototype.stop = function() {};

/**
 * Calling this method causes the arrangement sequencer to take over playback.
 *
 * @since API version 1
 */
Track.prototype.returnToArrangement = function() {};

/**
 * Updates the name of the track.
 *
 * @param name
          the new track name
 * @since API version 1
 */
Track.prototype.setName = function(name) {};

/**
 * Registers an observer that reports names for note key values on this track. The track might provide
 * special names for certain keys if it contains instruments that support that features, such as the Bitwig
 * Drum Machine.
 *
 * @param callback
          a callback function that receives two arguments: 1. the key value in the range [0..127], and
          2. the name string
 * @since API version 1
 */
Track.prototype.addPitchNamesObserver = function(callback) {};

/**
 * Plays a note on the track with a default duration and the given key and velocity.
 *
 * @param key
          the key value of the played note
 * @param velocity
          the velocity of the played note
 * @since API version 1
 */
Track.prototype.playNote = function(key, velocity) {};

/**
 * Starts playing a note on the track with the given key and velocity.
 *
 * @param key
          the key value of the played note
 * @param velocity
          the velocity of the played note
 * @since API version 1
 */
Track.prototype.startNote = function(key, velocity) {};

/**
 * Stops playing a currently played note.
 *
 * @param key
          the key value of the playing note
 * @param velocity
          the note-off velocity
 * @since API version 1
 */
Track.prototype.stopNote = function(key, velocity) {};

/**
 * Sends a MIDI message to the hardware device.
 *
 * @param status
          the status byte of the MIDI message
 * @param data1
          the data1 part of the MIDI message
 * @param data2
          the data2 part of the MIDI message
@since API version 2
 */
Track.prototype.sendMidi = function(status, data1, data2) {};

/**
 * Value that reports the track type. Possible reported track types are `Group`, `Instrument`, `Audio`,
 * `Hybrid`, `Effect` or `Master`.
 *
 * @return {StringValue}
 * @since API version 2
 */
Track.prototype.trackType = function() {};

/**
 * Value that reports if the track may contain child tracks, which is the case for group tracks.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Track.prototype.isGroup = function() {};

/**
 * Returns an object that indicates if the track may contain notes.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
Track.prototype.getCanHoldNoteData = function() {};

/**
 * Returns an object that indicates if the track may contain audio events.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
Track.prototype.getCanHoldAudioData = function() {};

/**
 * Returns an object that provides access to the cursor item of the track's device selection as shown in
 * the Bitwig Studio user interface.
 *
 * @return {CursorDevice} the requested device selection cursor object
@since API version 1
 */
Track.prototype.createCursorDevice = function() {};

/**
 * Creates a named device selection cursor that is independent from the device selection in the Bitwig
 * Studio user interface, assuming the name parameter is not null. When `name` is `null` the result is
 * equal to calling {@link Track#createCursorDevice}.
 *
 * @param name
          the name of the custom device selection cursor, for example "Primary", or `null` to refer to
          the device selection cursor in the arranger cursor track as shown in the Bitwig Studio user
          interface.
 * @return {CursorDevice} the requested device selection cursor object
@see Track#createCursorDevice
 * @since API version 1
 */
Track.prototype.createCursorDevice = function(name) {};

/**
 * Creates a named device selection cursor that is independent from the device selection in the Bitwig
 * Studio user interface, assuming the name parameter is not null. When `name` is `null` the result is
 * equal to calling {@link Track#createCursorDevice}.
 *
 * @param name
          the name of the custom device selection cursor, for example "Primary", or `null` to refer to
          the device selection cursor in the arranger cursor track as shown in the Bitwig Studio user
          interface.
 * @param numSends
          the number of sends that are simultaneously accessible in nested channels.
 * @return {CursorDevice} the requested device selection cursor object
@see Track#createCursorDevice
 * @since API version 1
 */
Track.prototype.createCursorDevice = function(name, numSends) {};

/**
 * Returns a track bank with the given number of child tracks, sends and scenes. The track bank will only
 * have content if the connected track is a group track.<br/>
 * 
 * A track bank can be seen as a fixed-size window onto the list of tracks in the connected track group
 * including their sends and scenes, that can be scrolled in order to access different parts of the track
 * list. For example a track bank configured for 8 tracks can show track 1-8, 2-9, 3-10 and so on.<br/>
 * 
 * The idea behind the `bank pattern` is that hardware typically is equipped with a fixed amount of channel
 * strips or controls, for example consider a mixing console with 8 channels, but Bitwig Studio documents
 * contain a dynamic list of tracks, most likely more tracks than the hardware can control simultaneously.
 * The track bank returned by this function provides a convenient interface for controlling which tracks
 * are currently shown on the hardware.<br/>
 * 
 * Creating a track bank using this method will consider all tracks in the document, including effect
 * tracks and the master track. Use {@link #createMainTrackBank} or {@link #createEffectTrackBank} in case
 * you are only interested in tracks of a certain kind.
 *
 * @param numTracks
          the number of child tracks spanned by the track bank
 * @param numSends
          the number of sends spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @param hasFlatTrackList
          specifies whether the track bank should operate on a flat list of all nested child tracks or
          only on the direct child tracks of the connected group track.
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
Track.prototype.createTrackBank = function(numTracks, numSends, numScenes, hasFlatTrackList) {};

/**
 * Returns a track bank with the given number of child tracks, sends and scenes. Only audio tracks,
 * instrument tracks and hybrid tracks are considered. The track bank will only have content if the
 * connected track is a group track. For more information about track banks and the `bank pattern` in
 * general, see the documentation for {@link #createTrackBank}.
 *
 * @param numTracks
          the number of child tracks spanned by the track bank
 * @param numSends
          the number of sends spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @param hasFlatTrackList
          specifies whether the track bank should operate on a flat list of all nested child tracks or
          only on the direct child tracks of the connected group track.
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
Track.prototype.createMainTrackBank = function(numTracks, numSends, numScenes, hasFlatTrackList) {};

/**
 * Returns a track bank with the given number of child effect tracks and scenes. Only effect tracks are
 * considered. The track bank will only have content if the connected track is a group track. For more
 * information about track banks and the `bank pattern` in general, see the documentation for
 * {@link #createTrackBank}.
 *
 * @param numTracks
          the number of child tracks spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @param hasFlatTrackList
          specifies whether the track bank should operate on a flat list of all nested child tracks or
          only on the direct child tracks of the connected group track.
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
Track.prototype.createEffectTrackBank = function(numTracks, numScenes, hasFlatTrackList) {};

/**
 * Returns an object that represents the master track of the connected track group. The returned object
 * will only have content if the connected track is a group track.
 *
 * @param numScenes
          the number of scenes for bank-wise navigation of the master tracks clip launcher slots.
 * @return {MasterTrack} an object representing the master track of the connected track group.
 * @since API version 1
 */
Track.prototype.createMasterTrack = function(numScenes) {};

/**
 * Returns a bank of sibling tracks with the given number of tracks, sends and scenes. For more information
 * about track banks and the `bank pattern` in general, see the documentation for {@link #createTrackBank}.
 *
 * @param numTracks
          the number of child tracks spanned by the track bank
 * @param numSends
          the number of sends spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @param shouldIncludeEffectTracks
          specifies whether effect tracks should be included
 * @param shouldIncludeMasterTrack
          specifies whether the master should be included
 * @return {TrackBank} an object for bank-wise navigation of sibling tracks
 * @since API version 1
 */
Track.prototype.createSiblingsTrackBank = function(numTracks, numSends, numScenes, shouldIncludeEffectTracks, shouldIncludeMasterTrack) {};
