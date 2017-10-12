/* API Version - 2.2 */

/**
 * An interface that provides methods for accessing the most common global application commands.<br/>
 * 
 * In addition, functions are provided for accessing any application action in a generic and categorized way,
 * pretty much as displayed in the Bitwig Studio commander dialog (see {@link #getActions()},
 * {@link #getAction(String)}, {@link #getActionCategories()}), {@link #getActionCategory(String)}).<br/>
 * 
 * To receive an instance of the application interface call {@link ControllerHost#createApplication()}.
 *
 * @since API version 1
 */
function Application() {}

/**
 * Creates a new audio track at the given position.
 *
 * @param position
          the index within the list of main tracks where the new track should be inserted, or `-1` in
          case the track should be inserted at the end of the list. Values outside the valid range will
          get pinned to the valid range, so the actual position might be different from the provided
          parameter value.
 * @since API version 1
 */
Application.prototype.createAudioTrack = function(position) {};

/**
 * Creates a new instrument track at the given position.
 *
 * @param position
          the index within the list of main tracks where the new track should be inserted, or `-1` in
          case the track should be inserted at the end of the list. Values outside the valid range will
          get pinned to the valid range, so the actual position might be different from the provided
          parameter value.
 * @since API version 1
 */
Application.prototype.createInstrumentTrack = function(position) {};

/**
 * Creates a new effect track at the given position.
 *
 * @param position
          the index within the list of effect tracks where the new track should be inserted, or `-1` in
          case the track should be inserted at the end of the list. Values outside the valid range will
          get pinned to the valid range, so the actual position might be different from the provided
          parameter value.
 * @since API version 1
 */
Application.prototype.createEffectTrack = function(position) {};

/**
 * Returns a list of actions that the application supports. Actions are commands in Bitwig Studio that are
 * typically accessible through menus or keyboard shortcuts.
 * 
 * Please note that many of the commands encapsulated by the reported actions are also accessible through
 * other (probably more convenient) interfaces methods of the API. In contrast to that, this method
 * provides a more generic way to find available application functionality.
 *
 * @return {Action[]} the list of actions
@since API version 1
 */
Application.prototype.getActions = function() {};

/**
 * Returns the action for the given action identifier. For a list of available actions, see
 * {@link #getActions()}.
 *
 * @param id
          the action identifier string, must not be `null`
 * @return {Action} the action associated with the given id, or null in case there is no action with the given
        identifier.
@since API version 1
 */
Application.prototype.getAction = function(id) {};

/**
 * Returns a list of action categories that is used by Bitwig Studio to group actions into categories.
 *
 * @return {ActionCategory[]} the list of action categories
@since API version 1
 */
Application.prototype.getActionCategories = function() {};

/**
 * Returns the action category associated with the given identifier. For a list of available action
 * categories, see {@link #getActionCategories()}.
 *
 * @param id
          the category identifier string, must not be `null`
 * @return {ActionCategory} the action associated with the given id, or null in case there is no category with the given
        identifier
@since API version 1
 */
Application.prototype.getActionCategory = function(id) {};

/**
 * Activates the audio engine in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.activateEngine = function() {};

/**
 * Deactivates the audio engine in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.deactivateEngine = function() {};

/**
 * Value that reports whether an audio engine is active or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Application.prototype.hasActiveEngine = function() {};

/**
 * Value that reports the name of the current project.
 *
 * @return {StringValue}
 * @since API version 2
 */
Application.prototype.projectName = function() {};

/**
 * Switches to the next project tab in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.nextProject = function() {};

/**
 * Switches to the previous project tab in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.previousProject = function() {};

/**
 * Set BitwigStudio to navigate into the group.
 *
 * @param {Track} track
 * @since API version 2
 */
Application.prototype.navigateIntoTrackGroup = function(track) {};

/**
 * Set BitwigStudio to navigate into the parent group.
 *
 * @since API version 2
 */
Application.prototype.navigateToParentTrackGroup = function() {};

/**
 * Sends an undo command to Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.undo = function() {};

/**
 * Sends a redo command to Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.redo = function() {};

/**
 * Switches the Bitwig Studio user interface to the panel layout with the given name. The list of available
 * panel layouts depends on the active display profile.
 *
 * @param panelLayout
          the name of the new panel layout
 * @since API version 1
 */
Application.prototype.setPanelLayout = function(panelLayout) {};

/**
 * Switches to the next panel layout of the active display profile in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.nextPanelLayout = function() {};

/**
 * Switches to the previous panel layout of the active display profile in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.previousPanelLayout = function() {};

/**
 * Value that reports the name of the active panel layout.
 *
 * @return {StringValue}
 * @since API version 2
 */
Application.prototype.panelLayout = function() {};

/**
 * Value that reports the name of the active display profile.
 *
 * @return {StringValue}
 * @since API version 2
 */
Application.prototype.displayProfile = function() {};

/**
 * Toggles the visibility of the inspector panel.
 *
 * @since API version 1
 */
Application.prototype.toggleInspector = function() {};

/**
 * Toggles the visibility of the device chain panel.
 *
 * @since API version 1
 */
Application.prototype.toggleDevices = function() {};

/**
 * Toggles the visibility of the mixer panel.
 *
 * @since API version 1
 */
Application.prototype.toggleMixer = function() {};

/**
 * Toggles the visibility of the note editor panel.
 *
 * @since API version 1
 */
Application.prototype.toggleNoteEditor = function() {};

/**
 * Toggles the visibility of the automation editor panel.
 *
 * @since API version 1
 */
Application.prototype.toggleAutomationEditor = function() {};

/**
 * Toggles the visibility of the browser panel.
 *
 * @since API version 1
 */
Application.prototype.toggleBrowserVisibility = function() {};

/**
 * Shows the previous detail panel (note editor, device, automation).
 *
 * @since API version 1
 */
Application.prototype.previousSubPanel = function() {};

/**
 * Shows the next detail panel (note editor, device, automation).
 *
 * @since API version 1
 */
Application.prototype.nextSubPanel = function() {};

/**
 * Equivalent to an Arrow-Left key stroke on the computer keyboard. The concrete functionality depends on
 * the current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.arrowKeyLeft = function() {};

/**
 * Equivalent to an Arrow-Right key stroke on the computer keyboard. The concrete functionality depends on
 * the current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.arrowKeyRight = function() {};

/**
 * Equivalent to an Arrow-Up key stroke on the computer keyboard. The concrete functionality depends on the
 * current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.arrowKeyUp = function() {};

/**
 * Equivalent to an Arrow-Down key stroke on the computer keyboard. The concrete functionality depends on
 * the current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.arrowKeyDown = function() {};

/**
 * Equivalent to an Enter key stroke on the computer keyboard. The concrete functionality depends on the
 * current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.enter = function() {};

/**
 * Equivalent to an Escape key stroke on the computer keyboard. The concrete functionality depends on the
 * current keyboard focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.escape = function() {};

/**
 * Selects all items according the current selection focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.selectAll = function() {};

/**
 * Deselects any items according the current selection focus in Bitwig Studio.
 *
 * @since API version 1
 */
Application.prototype.selectNone = function() {};

/**
 * Cuts the selected items in Bitwig Studio if applicable.
 *
 * @since API version 1
 */
Application.prototype.cut = function() {};

/**
 * Copies the selected items in Bitwig Studio to the clipboard if applicable.
 *
 * @since API version 1
 */
Application.prototype.copy = function() {};

/**
 * Pastes the clipboard contents into the current selection focus in Bitwig Studio if applicable.
 *
 * @since API version 1
 */
Application.prototype.paste = function() {};

/**
 * Duplicates the active selection in Bitwig Studio if applicable.
 *
 * @since API version 1
 */
Application.prototype.duplicate = function() {};

/**
 * Deletes the selected items in Bitwig Studio if applicable. Originally this function was called `delete`
 * (Bitwig Studio 1.0). But as `delete` is reserved in JavaScript this function got renamed to `remove` in
 * Bitwig Studio 1.0.9.
 *
 * @since API version 1
 */
Application.prototype.remove = function() {};

/**
 * Opens a text input field in Bitwig Studio for renaming the selected item.
 *
 * @since API version 1
 */
Application.prototype.rename = function() {};

/**
 * Zooms in one step into the currently focused editor of the Bitwig Studio user interface.
 *
 * @since API version 1
 */
Application.prototype.zoomIn = function() {};

/**
 * Zooms out one step in the currently focused editor of the Bitwig Studio user interface.
 *
 * @since API version 1
 */
Application.prototype.zoomOut = function() {};

/**
 * Adjusts the zoom level of the currently focused editor so that it matches the active selection.
 *
 * @since API version 1
 */
Application.prototype.zoomToSelection = function() {};

/**
 * Adjusts the zoom level of the currently focused editor so that all content becomes visible.
 *
 * @since API version 1
 */
Application.prototype.zoomToFit = function() {};

/**
 * Moves the panel focus to the panel on the left of the currently focused panel.
 *
 * @since API version 1
 */
Application.prototype.focusPanelToLeft = function() {};

/**
 * Moves the panel focus to the panel right to the currently focused panel.
 *
 * @since API version 1
 */
Application.prototype.focusPanelToRight = function() {};

/**
 * Moves the panel focus to the panel above the currently focused panel.
 *
 * @since API version 1
 */
Application.prototype.focusPanelAbove = function() {};

/**
 * Moves the panel focus to the panel below the currently focused panel.
 *
 * @since API version 1
 */
Application.prototype.focusPanelBelow = function() {};

/**
 * Toggles between full screen and windowed user interface.
 *
 * @since API version 1
 */
Application.prototype.toggleFullScreen = function() {};
