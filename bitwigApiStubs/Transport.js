/* API Version - 2.2 */

/**
 * An interface representing the transport section in Bitwig Studio.
 *
 * @since API version 1
 */
function Transport() {}

Transport.prototype = new ObjectProxy();
Transport.prototype.constructor = Transport;

/**
 * Starts playback in the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.play = function() {};

/**
 * Stops playback in the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.stop = function() {};

/**
 * Toggles the transport playback state between playing and stopped.
 *
 * @since API version 1
 */
Transport.prototype.togglePlay = function() {};

/**
 * When the transport is stopped, calling this function starts transport playback, otherwise the transport
 * is first stopped and the playback is restarted from the last play-start position.
 *
 * @since API version 1
 */
Transport.prototype.restart = function() {};

/**
 * Starts recording in the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.record = function() {};

/**
 * Rewinds the Bitwig Studio transport to the beginning of the arrangement.
 *
 * @since API version 1
 */
Transport.prototype.rewind = function() {};

/**
 * Calling this function is equivalent to pressing the fast forward button in the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.fastForward = function() {};

/**
 * When calling this function multiple times, the timing of those calls gets evaluated and causes
 * adjustments to the project tempo.
 *
 * @since API version 1
 */
Transport.prototype.tapTempo = function() {};

/**
 * Value that reports if the Bitwig Studio transport is playing.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isPlaying = function() {};

/**
 * Value that reports if the Bitwig Studio transport is recording.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isArrangerRecordEnabled = function() {};

/**
 * Value that reports if overdubbing is enabled in Bitwig Studio.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isArrangerOverdubEnabled = function() {};

/**
 * Value reports if clip launcher overdubbing is enabled in Bitwig Studio.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isClipLauncherOverdubEnabled = function() {};

/**
 * Value that reports the current automation write mode. Possible values are `"latch"`, `"touch"` or
 * `"write"`.
 *
 * @return {SettableEnumValue}
 * @since API version 2
 */
Transport.prototype.automationWriteMode = function() {};

/**
 * Value that reports if automation write is currently enabled for the arranger.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isArrangerAutomationWriteEnabled = function() {};

/**
 * Value that reports if automation write is currently enabled on the clip launcher.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isClipLauncherAutomationWriteEnabled = function() {};

/**
 * Value that indicates if automation override is currently on.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Transport.prototype.isAutomationOverrideActive = function() {};

/**
 * Value that indicates if the loop is currently active or not.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isArrangerLoopEnabled = function() {};

/**
 * Value that reports if punch-in is enabled in the Bitwig Studio transport.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isPunchInEnabled = function() {};

/**
 * Value that reports if punch-in is enabled in the Bitwig Studio transport.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isPunchOutEnabled = function() {};

/**
 * Value that reports if the metronome is enabled in Bitwig Studio.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isMetronomeEnabled = function() {};

/**
 * Value that reports if the metronome has tick playback enabled.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isMetronomeTickPlaybackEnabled = function() {};

/**
 * Value that reports the metronome volume.
 *
 * @return {SettableRangedValue}
 * @since API version 2
 */
Transport.prototype.metronomeVolume = function() {};

/**
 * Value that reports if the metronome is audible during pre-roll.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Transport.prototype.isMetronomeAudibleDuringPreRoll = function() {};

/**
 * Value that reports the current pre-roll setting. Possible values are `"none"`, `"one_bar"`,
 * `"two_bars"`, or `"four_bars"`.
 *
 * @return {SettableEnumValue}
 * @since API version 2
 */
Transport.prototype.preRoll = function() {};

/**
 * Toggles the latch automation write mode in the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.toggleLatchAutomationWriteMode = function() {};

/**
 * Toggles the arranger automation write enabled state of the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.toggleWriteArrangerAutomation = function() {};

/**
 * Toggles the clip launcher automation write enabled state of the Bitwig Studio transport.
 *
 * @since API version 1
 */
Transport.prototype.toggleWriteClipLauncherAutomation = function() {};

/**
 * Resets any automation overrides in Bitwig Studio.
 *
 * @since API version 1
 */
Transport.prototype.resetAutomationOverrides = function() {};

/**
 * Switches playback to the arrangement sequencer on all tracks.
 *
 * @since API version 1
 */
Transport.prototype.returnToArrangement = function() {};

/**
 * Returns an object that provides access to the project tempo.
 *
 * @return {Parameter} the requested tempo value object
 * @since API version 1
 */
Transport.prototype.tempo = function() {};

/**
 * Increases the project tempo value by the given amount, which is specified relative to the given range.
 *
 * @param amount
          the new tempo value relative to the specified range. Values should be in the range
          [0..range-1].
 * @param range
          the range of the provided amount value
 * @since API version 1
 */
Transport.prototype.increaseTempo = function(amount, range) {};

/**
 * Returns an object that provides access to the transport position in Bitwig Studio.
 *
 * @return {SettableBeatTimeValue} a beat time object that represents the transport position
 * @since API version 1
 */
Transport.prototype.getPosition = function() {};

/**
 * Sets the transport playback position to the given beat time value.
 *
 * @param beats
          the new playback position in beats
 * @since API version 1
 */
Transport.prototype.setPosition = function(beats) {};

/**
 * Increases the transport position value by the given number of beats, which is specified relative to the
 * given range.
 *
 * @param beats
          the beat time value that gets added to the current transport position. Values have double
          precision and can be positive or negative.
 * @param snap
          when `true` the actual new transport position will be quantized to the beat grid, when `false`
          the position will be increased exactly by the specified beat time
 * @since API version 1
 */
Transport.prototype.incPosition = function(beats, snap) {};

/**
 * Returns an object that provides access to the punch-in position in the Bitwig Studio transport.
 *
 * @return {SettableBeatTimeValue} a beat time object that represents the punch-in position
 * @since API version 1
 */
Transport.prototype.getInPosition = function() {};

/**
 * Returns an object that provides access to the punch-out position in the Bitwig Studio transport.
 *
 * @return {SettableBeatTimeValue} a beat time object that represents the punch-out position
 * @since API version 1
 */
Transport.prototype.getOutPosition = function() {};

/**
 * Returns an object that provides access to the cross-fader, used for mixing between A/B-channels as
 * specified on the Bitwig Studio tracks.
 *
 * @return {Parameter}
 * @since API version 1
 */
Transport.prototype.getCrossfade = function() {};

/**
 * Returns an object that provides access to the transport time signature.
 *
 * @return {TimeSignatureValue} the time signature value object that represents the transport time signature.
 * @since API version 1
 */
Transport.prototype.getTimeSignature = function() {};

/**
 * Value that reports the current clip launcher post recording action. Possible values are `"off"`,
 * `"play_recorded"`, `"record_next_free_slot"`, `"stop"`, `"return_to_arrangement"`,
 * `"return_to_previous_clip"` or `"play_random"`.
 *
 * @return {SettableEnumValue}
 * @since API version 2
 */
Transport.prototype.clipLauncherPostRecordingAction = function() {};

/**
 * Returns an object that provides access to the clip launcher post recording time offset.
 *
 * @return {SettableBeatTimeValue} a beat time object that represents the post recording time offset
 * @since API version 1
 */
Transport.prototype.getClipLauncherPostRecordingTimeOffset = function() {};
