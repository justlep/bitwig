/* API Version - 2.2 */

/**
 * An interface that provides access to the contents of a clip in Bitwig Studio.
 * 
 * The note content of the clip is exposed in terms of steps and keys, mainly targeted to x-y-grid
 * applications such as step sequencers.
 *
 * @since API version 1
 */
function Clip() {}

Clip.prototype = new ObjectProxy();
Clip.prototype.constructor = Clip;

/**
 * Scroll the note grid so that the given key becomes visible.
 *
 * @param key
          the key that should become visible
 * @since API version 1
 */
Clip.prototype.scrollToKey = function(key) {};

/**
 * Scrolls the note grid keys one page up. For example if the note grid is configured to show 12 keys and
 * is currently showing keys [36..47], calling this method would scroll the note grid to key range
 * [48..59].
 *
 * @since API version 1
 */
Clip.prototype.scrollKeysPageUp = function() {};

/**
 * Scrolls the note grid keys one page down. For example if the note grid is configured to show 12 keys and
 * is currently showing keys [36..47], calling this method would scroll the note grid to key range
 * [48..59].
 *
 * @since API version 1
 */
Clip.prototype.scrollKeysPageDown = function() {};

/**
 * Scrolls the note grid keys one key up. For example if the note grid is configured to show 12 keys and is
 * currently showing keys [36..47], calling this method would scroll the note grid to key range [37..48].
 *
 * @since API version 1
 */
Clip.prototype.scrollKeysStepUp = function() {};

/**
 * Scrolls the note grid keys one key down. For example if the note grid is configured to show 12 keys and
 * is currently showing keys [36..47], calling this method would scroll the note grid to key range
 * [35..46].
 *
 * @since API version 1
 */
Clip.prototype.scrollKeysStepDown = function() {};

/**
 * Scroll the note grid so that the given step becomes visible.
 *
 * @param step
          the step that should become visible
 * @since API version 1
 */
Clip.prototype.scrollToStep = function(step) {};

/**
 * Scrolls the note grid steps one page forward. For example if the note grid is configured to show 16
 * steps and is currently showing keys [0..15], calling this method would scroll the note grid to key range
 * [16..31].
 *
 * @since API version 1
 */
Clip.prototype.scrollStepsPageForward = function() {};

/**
 * Scrolls the note grid steps one page backwards. For example if the note grid is configured to show 16
 * steps and is currently showing keys [16..31], calling this method would scroll the note grid to key
 * range [0..16].
 *
 * @since API version 1
 */
Clip.prototype.scrollStepsPageBackwards = function() {};

/**
 * Scrolls the note grid steps one step forward. For example if the note grid is configured to show 16
 * steps and is currently showing keys [0..15], calling this method would scroll the note grid to key range
 * [1..16].
 *
 * @since API version 1
 */
Clip.prototype.scrollStepsStepForward = function() {};

/**
 * Scrolls the note grid steps one step backwards. For example if the note grid is configured to show 16
 * steps and is currently showing keys [1..16], calling this method would scroll the note grid to key range
 * [0..15].
 *
 * @since API version 1
 */
Clip.prototype.scrollStepsStepBackwards = function() {};

/**
 * Value that reports if the note grid keys can be scrolled further up.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Clip.prototype.canScrollKeysUp = function() {};

/**
 * Value that reports if the note grid keys can be scrolled further down.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Clip.prototype.canScrollKeysDown = function() {};

/**
 * Value that reports if the note grid if the note grid steps can be scrolled backwards.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Clip.prototype.canScrollStepsBackwards = function() {};

/**
 * Value that reports if the note grid if the note grid steps can be scrolled forwards.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Clip.prototype.canScrollStepsForwards = function() {};

/**
 * Toggles the existence of a note in the note grid cell specified by the given x and y arguments.
 *
 * @param x
          the x position within the note grid, defining the step/time of the target note
 * @param y
          the y position within the note grid, defining the key of the target note
 * @param insertVelocity
          the velocity of the target note in case a new note gets inserted
 * @since API version 1
 */
Clip.prototype.toggleStep = function(x, y, insertVelocity) {};

/**
 * Creates a note in the grid cell specified by the given x and y arguments. Existing notes are
 * overwritten.
 *
 * @param x
          the x position within the note grid, defining the step/time of the new note
 * @param y
          the y position within the note grid, defining the key of the new note
 * @param insertVelocity
          the velocity of the new note
 * @param insertDuration
          the duration of the new note
 * @since API version 1
 */
Clip.prototype.setStep = function(x, y, insertVelocity, insertDuration) {};

/**
 * Removes the note in the grid cell specified by the given x and y arguments. Calling this method does
 * nothing in case no note exists at the given x-y-coordinates.
 *
 * @param x
          the x position within the note grid, defining the step/time of the target note
 * @param y
          the y position within the note grid, defining the key of the target note
 * @since API version 1
 */
Clip.prototype.clearStep = function(x, y) {};

/**
 * Removes all notes in the grid row specified by the given y argument.
 *
 * @param y
          the y position within the note grid, defining the key of the target note
 * @since API version 1
 */
Clip.prototype.clearSteps = function(y) {};

/**
 * Removes all notes in the grid.
 *
 * @since API version 1
 */
Clip.prototype.clearSteps = function() {};

/**
 * Selects the note in the grid cell specified by the given x and y arguments, in case there actually is a
 * note at the given x-y-coordinates.
 *
 * @param x
          the x position within the note grid, defining the step/time of the target note
 * @param y
          the y position within the note grid, defining the key of the target note
 * @param clearCurrentSelection
          `true` if the existing selection should be cleared, {@false} if the note should be added to
          the current selection.
 * @since API version 1
 */
Clip.prototype.selectStepContents = function(x, y, clearCurrentSelection) {};

/**
 * Sets the beat time duration that is represented by one note grid step.
 *
 * @param lengthInBeatTime
          the length of one note grid step in beat time.
 * @since API version 1
 */
Clip.prototype.setStepSize = function(lengthInBeatTime) {};

/**
 * Registers an observer that reports which note grid steps/keys contain notes.
 *
 * @param callback
          A callback function that receives three parameters: 1. the x (step) coordinate within the note
          grid (integer), 2. the y (key) coordinate within the note grid (integer), and 3. an integer
          value that indicates if the step is empty (`0`) or if a note continues playing (`1`) or starts
          playing (`2`).
 * @since API version 1
 */
Clip.prototype.addStepDataObserver = function(callback) {};

/**
 * Value that reports note grid cells as they get played by the sequencer.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
Clip.prototype.playingStep = function() {};

/**
 * Updates the name of the clip.
 *
 * @param name
          the new clip name
 * @since API version 1
 */
Clip.prototype.setName = function(name) {};

/**
 * Returns shuffle settings of the clip.
 *
 * @return {SettableBooleanValue} the value object that represents the clips shuffle setting.
 * @since API version 1
 */
Clip.prototype.getShuffle = function() {};

/**
 * Returns accent setting of the clip.
 *
 * @return {SettableRangedValue} the ranged value object that represents the clips accent setting.
 * @since API version 1
 */
Clip.prototype.getAccent = function() {};

/**
 * Returns the start of the clip in beat time.
 *
 * @return {SettableBeatTimeValue} the beat time object that represents the clips start time.
 * @since API version 1
 */
Clip.prototype.getPlayStart = function() {};

/**
 * Returns the length of the clip in beat time.
 *
 * @return {SettableBeatTimeValue} the beat time object that represents the duration of the clip.
 * @since API version 1
 */
Clip.prototype.getPlayStop = function() {};

/**
 * Returns an object that provides access to the loop enabled state of the clip.
 *
 * @return {SettableBooleanValue} a boolean value object.
 * @since API version 1
 */
Clip.prototype.isLoopEnabled = function() {};

/**
 * Returns the loop start time of the clip in beat time.
 *
 * @return {SettableBeatTimeValue} the beat time object that represents the clips loop start time.
 * @since API version 1
 */
Clip.prototype.getLoopStart = function() {};

/**
 * Returns the loop length of the clip in beat time.
 *
 * @return {SettableBeatTimeValue} the beat time object that represents the clips loop length.
 * @since API version 1
 */
Clip.prototype.getLoopLength = function() {};

/**
 * Get the color of the clip.
 *
 * @return {SettableColorValue}
 * @since API version 2
 */
Clip.prototype.color = function() {};

/**
 * Duplicates the clip.
 *
 * @since API version 1
 */
Clip.prototype.duplicate = function() {};

/**
 * Duplicates the content of the clip.
 *
 * @since API version 1
 */
Clip.prototype.duplicateContent = function() {};

/**
 * Transposes all notes in the clip by the given number of semitones.
 *
 * @param semitones
          the amount of semitones to transpose, can be a positive or negative integer value.
 * @since API version 1
 */
Clip.prototype.transpose = function(semitones) {};

/**
 * Quantizes the start time of all notes in the clip according to the given amount. The note lengths remain
 * the same as before.
 *
 * @param amount
          a factor between `0` and `1` that allows to morph between the original note start and the
          quantized note start.
 * @since API version 1
 */
Clip.prototype.quantize = function(amount) {};

/**
 * Gets the track that contains the clip.
 *
 * @return {Track} a track object that represents the track which contains the clip.
 * @since API version 1
 */
Clip.prototype.getTrack = function() {};
