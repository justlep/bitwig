/* API Version - 2.2 */

/**
 * An interface representing the host application to the script. A singleton instance of this interface is
 * available in the global scope of each script. The methods provided by this interface can be divided in
 * different categories:
 * 
 * 1. functions for registering the script in Bitwig Studio, so that it can be listed, detected and configured
 * in the controller preferences. The methods that belong to this group are {@link #defineController},
 * {@link #defineMidiPorts}, {@link #defineSysexIdentityReply} and {@link #addDeviceNameBasedDiscoveryPair}.
 * 2. functions for creating objects that provide access to the various areas of Bitwig Studio to the script.
 * The name of those methods typically start with `create...` 3. functions for printing to the Control Surface
 * Console, which can be opened from the `View` menu of Bitwig Studio. 4. functions for determining the name
 * of the host application, API version, the host operating system and such.
 * 
 * The first group of methods should be called on the global scope of the script. The function in the second
 * and third group are typically called from the init method of the script or other handler functions. The
 * last group is probably only required in rare cases and can be called any time.
 *
 * @mainpage Introduction

Welcome to the Bitwig Control Surface API.<br/>

The pages shown here include the reference documentation for the various interfaces and functions provided
by the API.<br/>

The best starting point for becoming familiar with the API within these pages is the documentation of the
{@link Host} interface. A singleton instance of that interface is available in the scope of each script.
In addition it is highly recommended to also walk through the <b>Control Surface Scripting Guide</b> that is
available from the @em Help menu in Bitwig Studio.
 * @include api-changes
 * @since API version 1
 */
function ControllerHost() {}

ControllerHost.prototype = new Host();
ControllerHost.prototype.constructor = ControllerHost;

/**
 * Loads the supplied API version into the calling script. This is only intended to be called from a controller
 * script. It cannot be called from a Java controller extension.
 *
 * @param {int} version
 */
ControllerHost.prototype.loadAPI = function(version) {};

/**
 * Determines whether the calling script should fail if it calls a deprecated method based on the API version
 * that it requested.
 *
 * @return {boolean}
 */
ControllerHost.prototype.shouldFailOnDeprecatedUse = function() {};

/**
 * Sets whether the calling script should fail if it calls a deprecated method based on the API version
 * that it requested. This is only intended to be called from a controller
 * script. It cannot be called from a Java controller extension.
 *
 * @param {boolean} value
 */
ControllerHost.prototype.setShouldFailOnDeprecatedUse = function(value) {};

/**
 * Loads the script defined by the supplied path. This is only intended to be called from a controller
 * script. It cannot be called from a Java controller extension.
 *
 * @param {string} path
 */
ControllerHost.prototype.load = function(path) {};

/**
 * Indicates if the host platform is Windows.
 *
 * @return {boolean} `true` if the host platform is Windows, `false` otherwise.
 * @since API version 1
 */
ControllerHost.prototype.platformIsWindows = function() {};

/**
 * Indicates if the host platform is Apple Mac OS X.
 *
 * @return {boolean} `true` if the host platform is Mac, `false` otherwise.
 * @since API version 1
 */
ControllerHost.prototype.platformIsMac = function() {};

/**
 * Indicates if the host platform is Linux.
 *
 * @return {boolean} `true` if the host platform is Linux, `false` otherwise.
 * @since API version 1
 */
ControllerHost.prototype.platformIsLinux = function() {};

/**
 * Registers a controller script with the given parameters. This function must be called once at the global
 * scope of the script.
 *
 * @param vendor
          the name of the hardware vendor. Must not be <code>null</code>.
 * @param name
          the name of the controller script as listed in the user interface of Bitwig Studio. Must not
          be <code>null</code>.
 * @param version
          the version of the controller script. Must not be <code>null</code>.
 * @param uuid
          a universal unique identifier (UUID) string that is used to distinguish one script from
          another, for example `550e8400-e29b-11d4-a716-446655440000`. Must not be <code>null</code>.
          For generating random UUID strings several free web tools are available.
 * @param author
          the name of the script author
 * @since API version 1
 */
ControllerHost.prototype.defineController = function(vendor, name, version, uuid, author) {};

/**
 * Defines the number of MIDI ports for input and output that the device uses. This method should be called
 * once in the global scope if the script is supposed to exchange MIDI messages with the device, or if the
 * script adds entries to the MIDI input/output choosers in Bitwig Studio. After calling this method the
 * individual port objects can be accessed using {@link #getMidiInPort(int index)} and
 * {@link #getMidiInPort(int index)}.
 *
 * @param numInports
          the number of input ports
 * @param numOutports
          the number of output ports
 * @since API version 1
 */
ControllerHost.prototype.defineMidiPorts = function(numInports, numOutports) {};

/**
 * Returns the MIDI input port with the given index.
 *
 * @param index
          the index of the MIDI input port, must be valid.
 * @return {MidiIn} the requested MIDI input port
 * @since API version 1
 */
ControllerHost.prototype.getMidiInPort = function(index) {};

/**
 * Returns the MIDI output port with the given index.
 *
 * @param index
          the index of the MIDI output port, must be valid.
 * @return {MidiOut} the requested MIDI output port
 * @since API version 1
 */
ControllerHost.prototype.getMidiOutPort = function(index) {};

/**
 * Registers patterns which are used to automatically detect hardware devices that can be used with the
 * script.<br/>
 * 
 * When the user clicks on the `detect` button in the Bitwig Studio controller preferences dialog, Bitwig
 * Studio searches for connected controller hardware by comparing the parameters passed into this function
 * are compared with the port names of the available MIDI drivers. Found controller scripts are
 * automatically added with their input/output ports configured.<br/>
 * 
 * Calling this function is optional, but can also be called multiple times in the global script scope in
 * order to support alternative driver names.
 *
 * @param inputs
          the array of strings used to detect MIDI input ports, must not be `null`.
 * @param outputs
          the array of strings used to detect MIDI output ports, must not be `null`.
 * @since API version 1
 */
ControllerHost.prototype.addDeviceNameBasedDiscoveryPair = function(inputs, outputs) {};

/**
 * Creates a preferences object that can be used to insert settings into the Controller Preferences panel
 * in Bitwig Studio.
 *
 * @return {Preferences} an object that provides access to custom controller preferences
 * @since API version 1
 */
ControllerHost.prototype.getPreferences = function() {};

/**
 * Creates a document state object that can be used to insert settings into the Studio I/O Panel in Bitwig
 * Studio.
 *
 * @return {DocumentState} an object that provides access to custom document settings
 * @since API version 1
 */
ControllerHost.prototype.getDocumentState = function() {};

/**
 * Returns an object that is used to configure automatic notifications. Bitwig Studio supports automatic
 * visual feedback from controllers that shows up as popup notifications. For example when the selected
 * track or the current device preset was changed on the controller these notifications are shown,
 * depending on your configuration.
 *
 * @return {NotificationSettings} a configuration object used to enable/disable the various automatic notifications supported by
        Bitwig Studio
 * @since API version 1
 */
ControllerHost.prototype.getNotificationSettings = function() {};

/**
 * Returns an object for controlling various aspects of the currently selected project.
 *
 * @return {Project}
 * @since API version 1
 */
ControllerHost.prototype.getProject = function() {};

/**
 * Returns an object for controlling and monitoring the elements of the `Transport` section in Bitwig
 * Studio. This function should be called once during initialization of the script if transport access is
 * desired.
 *
 * @return {Transport} an object that represents the `Transport` section in Bitwig Studio.
 * @since API version 1
 */
ControllerHost.prototype.createTransport = function() {};

/**
 * Returns an object for controlling and monitoring the `Groove` section in Bitwig Studio. This function
 * should be called once during initialization of the script if groove control is desired.
 *
 * @return {Groove} an object that represents the `Groove` section in Bitwig Studio.
 * @since API version 1
 */
ControllerHost.prototype.createGroove = function() {};

/**
 * Returns an object that provides access to general application functionality, including global view
 * settings, the list of open projects, and other global settings that are not related to a certain
 * document.
 *
 * @return {Application} an application object.
 * @since API version 1
 */
ControllerHost.prototype.createApplication = function() {};

/**
 * Returns an object which provides access to the `Arranger` panel of Bitwig Studio. Calling this function
 * is equal to `createArranger(-1)`.
 *
 * @return {Arranger} an arranger object
 * @since API version 1
 */
ControllerHost.prototype.createArranger = function() {};

/**
 * Returns an object which provides access to the `Arranger` panel inside the specified window.
 *
 * @param window
          the index of the window where the arranger panel is shown, or -1 in case the first arranger
          panel found on any window should be taken
 * @return {Arranger} an arranger object
 * @since API version 1
 */
ControllerHost.prototype.createArranger = function(window) {};

/**
 * Returns an object which provides access to the `Mixer` panel of Bitwig Studio. Calling this function is
 * equal to `createMixer(-1, null)`.
 *
 * @return {Mixer} a `Mixer` object
 * @since API version 1
 */
ControllerHost.prototype.createMixer = function() {};

/**
 * Returns an object which provides access to the `Mixer` panel that belongs to the specified panel layout.
 * Calling this function is equal to `createMixer(-1, panelLayout)`.
 *
 * @param panelLayout
          the name of the panel layout that contains the mixer panel, or `null` in case the selected
          panel layout in Bitwig Studio should be followed. Empty strings or invalid names are treated
          the same way as `null`. To receive the list of available panel layouts see
          {@link Application#addPanelLayoutObserver}.
 * @return {Mixer} a `Mixer` object
 * @since API version 1
 */
ControllerHost.prototype.createMixer = function(panelLayout) {};

/**
 * Returns an object which provides access to the `Mixer` panel inside the specified window. Calling this
 * function is equal to `createMixer(window, null)`.
 *
 * @param window
          the index of the window where the mixer panel is shown, or -1 in case the first mixer panel
          found on any window should be taken
 * @return {Mixer} a `Mixer` object
 * @since API version 1
 */
ControllerHost.prototype.createMixer = function(window) {};

/**
 * Returns an object which provides access to the `Mixer` panel that matches the specified parameters.
 *
 * @param panelLayout
          the name of the panel layout that contains the mixer panel, or `null` in case the selected
          panel layout in Bitwig Studio should be followed. Empty strings or invalid names are treated
          the same way as `null`. To receive the list of available panel layouts see
          {@link Application#addPanelLayoutObserver}.
 * @param window
          the index of the window where the mixer panel is shown, or -1 in case the first mixer panel
          found on any window should be taken
 * @return {Mixer} a `Mixer` object
 * @since API version 1
 */
ControllerHost.prototype.createMixer = function(panelLayout, window) {};

/**
 * Returns a track bank with the given number of tracks, sends and scenes.<br/>
 * 
 * A track bank can be seen as a fixed-size window onto the list of tracks in the current document
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
          the number of tracks spanned by the track bank
 * @param numSends
          the number of sends spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
ControllerHost.prototype.createTrackBank = function(numTracks, numSends, numScenes) {};

/**
 * Returns a track bank with the given number of child tracks, sends and scenes.<br/>
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
ControllerHost.prototype.createTrackBank = function(numTracks, numSends, numScenes, hasFlatTrackList) {};

/**
 * Returns a track bank with the given number of tracks, sends and scenes. Only audio tracks, instrument
 * tracks and hybrid tracks are considered. For more information about track banks and the `bank pattern`
 * in general, see the documentation for {@link #createTrackBank}.
 *
 * @param numTracks
          the number of tracks spanned by the track bank
 * @param numSends
          the number of sends spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
ControllerHost.prototype.createMainTrackBank = function(numTracks, numSends, numScenes) {};

/**
 * Returns a track bank with the given number of effect tracks and scenes. Only effect tracks are
 * considered. For more information about track banks and the `bank pattern` in general, see the
 * documentation for {@link #createTrackBank}.
 *
 * @param numTracks
          the number of tracks spanned by the track bank
 * @param numScenes
          the number of scenes spanned by the track bank
 * @return {TrackBank} an object for bank-wise navigation of tracks, sends and scenes
 * @since API version 1
 */
ControllerHost.prototype.createEffectTrackBank = function(numTracks, numScenes) {};

/**
 * Returns an object that represents the master track of the document.
 *
 * @param numScenes
          the number of scenes for bank-wise navigation of the master tracks clip launcher slots.
 * @return {MasterTrack} an object representing the master track.
 * @since API version 1
 */
ControllerHost.prototype.createMasterTrack = function(numScenes) {};

/**
 * Returns an object that represents the cursor item of the arranger track selection.
 *
 * @param numSends
          the number of sends for bank-wise navigation of the sends that are associated with the track
          selection
 * @param numScenes
          the number of scenes for bank-wise navigation of the clip launcher slots that are associated
          with the track selection
 * @return {CursorTrack} an object representing the currently selected arranger track (in the future also multiple
        tracks)
 * @since API version 1
 */
ControllerHost.prototype.createArrangerCursorTrack = function(numSends, numScenes) {};

/**
 * Returns an object that represents a named cursor track, that is independent from the arranger or mixer
 * track selection in the user interface of Bitwig Studio.
 *
 * @param name
          the name of the track cursor
 * @param numSends
          the number of sends for bank-wise navigation of the sends that are associated with the track
          selection
 * @param numScenes
          the number of scenes for bank-wise navigation of the clip launcher slots that are associated
          with the track selection
 * @return {CursorTrack} an object representing the currently selected arranger track (in the future also multiple
        tracks).
 * @since API version 1
 */
ControllerHost.prototype.createCursorTrack = function(name, numSends, numScenes) {};

/**
 * Returns an object that represents a named cursor track, that is independent from the arranger or mixer
 * track selection in the user interface of Bitwig Studio.
 *
 * @param {string} id
 * @param {string} name
 * @param {int} numSends
 * @param {int} numScenes
 * @param {boolean} shouldFollowSelection
 * @return {CursorTrack} an object representing the currently selected arranger track (in the future also multiple
        tracks).
 * @since API version 1
 */
ControllerHost.prototype.createCursorTrack = function(id, name, numSends, numScenes, shouldFollowSelection) {};

/**
 * Returns a scene bank with the given number of scenes.<br/>
 * 
 * A scene bank can be seen as a fixed-size window onto the list of scenes in the current document, that
 * can be scrolled in order to access different parts of the scene list. For example a scene bank
 * configured for 8 scenes can show scene 1-8, 2-9, 3-10 and so on.<br/>
 * 
 * The idea behind the `bank pattern` is that hardware typically is equipped with a fixed amount of channel
 * strips or controls, for example consider a mixing console with 8 channels, but Bitwig Studio documents
 * contain a dynamic list of scenes, most likely more scenes than the hardware can control simultaneously.
 * The scene bank returned by this function provides a convenient interface for controlling which scenes
 * are currently shown on the hardware.<br/>
 *
 * @param numScenes
          the number of scenes spanned by the track bank
 * @return {SceneBank} an object for bank-wise navigation of scenes
 * @since API version 1
 */
ControllerHost.prototype.createSceneBank = function(numScenes) {};

/**
 * Returns an object that represents the cursor device in devices selections made by the user in Bitwig
 * Studio. Calling this method is equal to the following code: {@code
 * var cursorTrack = createArrangerCursorTrack(numSends, numScenes);
 * var cursorDevice = cursorTrack.createCursorDevice();
 * } To create a custom device selection that is not connected to the main device selection in the user
 * interface, call {@link Track#createCursorDevice(String) cursorTrack.createCursorDevice(String name)}.
 *
 * @param numSends
          the number of sends that are simultaneously accessible in nested channels.
 * @return {CursorDevice} an object representing the currently selected device.
 * @since API version 1
 */
ControllerHost.prototype.createEditorCursorDevice = function(numSends) {};

/**
 * Returns a clip object that represents the cursor of the launcher clip selection. The gridWidth and
 * gridHeight parameters specify the grid dimensions used to access the note content of the clip.
 *
 * @param gridWidth
          the number of steps spanned by one page of the note content grid.
 * @param gridHeight
          the number of keys spanned by one page of the note content grid.
 * @return {Clip} an object representing the currently selected cursor clip
 * @since API version 1
 */
ControllerHost.prototype.createLauncherCursorClip = function(gridWidth, gridHeight) {};

/**
 * Returns a clip object that represents the cursor of the arranger clip selection. The gridWidth and
 * gridHeight parameters specify the grid dimensions used to access the note content of the clip.
 *
 * @param gridWidth
          the number of steps spanned by one page of the note content grid.
 * @param gridHeight
          the number of keys spanned by one page of the note content grid.
 * @return {Clip} an object representing the currently selected cursor clip
 * @since API version 1
 */
ControllerHost.prototype.createArrangerCursorClip = function(gridWidth, gridHeight) {};

/**
 * Returns an object that is used to define a bank of custom user controls. These controls are available to
 * the user for free controller assignments and are typically used when bank-wise navigation is
 * inconvenient.
 *
 * @param numControllers
          the number of controls that are available for free assignments
 * @return {UserControlBank} An object that represents a set of custom user controls.
 * @since API version 1
 */
ControllerHost.prototype.createUserControls = function(numControllers) {};

/**
 * Schedules the given callback function for execution after the given delay. For timer applications call
 * this method once initially and then from within the callback function.
 *
 * @param {java.lang.Runnable} callback
 * @param {long} delay
 * @since API version 2
 */
ControllerHost.prototype.scheduleTask = function(callback, delay) {};

/**
 * Requests that the driver's flush method gets called.
 *
 * @since API version 2
 */
ControllerHost.prototype.requestFlush = function() {};

/**
 * Prints the given string in the control surface console window. The console window can be opened in the
 * view menu of Bitwig Studio.
 *
 * @param s
          the string to be printed
 * @since API version 1
 */
ControllerHost.prototype.println = function(s) {};

/**
 * Prints the given string in the control surface console window using a text style that highlights the
 * string as error. The console window can be opened in the view menu of Bitwig Studio.
 *
 * @param s
          the error string to be printed
 * @since API version 1
 */
ControllerHost.prototype.errorln = function(s) {};

/**
 * Shows a temporary text overlay on top of the application GUI, that will fade-out after a short interval.
 * If the overlay is already shown, it will get updated with the given text.
 *
 * @param text
          the text to be shown
 * @since API version 1
 */
ControllerHost.prototype.showPopupNotification = function(text) {};

/**
 * Opens a TCP (Transmission Control Protocol) host socket for allowing network connections from other
 * hardware and software.
 *
 * @param name
          a meaningful name that describes the purpose of this connection.
 * @param defaultPort
          the port that should be used for the connection. If the port is already in use, then another
          port will be used. Check {@link RemoteSocket#getPort()} on the returned object to be sure.
 * @return {RemoteSocket} the object that represents the socket
 * @since API version 1
 */
ControllerHost.prototype.createRemoteConnection = function(name, defaultPort) {};

/**
 * Connects to a remote TCP (Transmission Control Protocol) socket.
 *
 * @param host
          the host name or IP address to connect to.
 * @param port
          the port to connect to
 * @param callback
          the callback function that gets called when the connection gets established. A single
          {@link RemoteConnection} parameter is passed into the callback function.
 * @since API version 1
 */
ControllerHost.prototype.connectToRemoteHost = function(host, port, callback) {};

/**
 * Sends a UDP (User Datagram Protocol) packet with the given data to the specified host.
 *
 * @param host
          the destination host name or IP address
 * @param port
          the destination port
 * @param data
          the data to be send. When creating a numeric byte array in JavaScript, the byte values must be
          signed (in the range -128..127).
 * @since API version 1
 */
ControllerHost.prototype.sendDatagramPacket = function(host, port, data) {};

/**
 * Adds an observer for incoming UDP (User Datagram Protocol) packets on the selected port.
 *
 * @param name
          a meaningful name that describes the purpose of this observer.
 * @param port
          the port that should be used
 * @param callback
          the callback function that gets called when data arrives. The function receives a single
          parameter that contains the data byte array.
 * @return {boolean} {@true} if was possible to bind the port, false otherwise
 * @since API version 1
 */
ControllerHost.prototype.addDatagramPacketObserver = function(name, port, callback) {};

/**
 * @param {int} numSends
 * @param {int} numScenes
 * @return {CursorTrack}
 * @since API version 1
 */
ControllerHost.prototype.createCursorTrack = function(numSends, numScenes) {};

/**
 * Creates a {@link PopupBrowser} that represents the pop-up browser in Bitwig Studio.
 *
 * @return {PopupBrowser}
 * @since API version 2
 */
ControllerHost.prototype.createPopupBrowser = function() {};

/**
 * {@link BeatTimeFormatter} used to format beat times by default. This will be used to format beat times
 * when asking for a beat time in string format without providing any formatting options. For example by
 * calling {@link BeatTimeStringValue#get()}.
 *
 * @return {BeatTimeFormatter}
 * @since API version 2
 */
ControllerHost.prototype.defaultBeatTimeFormatter = function() {};

/**
 * Sets the {@link BeatTimeFormatter} to use by default for formatting beat times.
 *
 * @param {BeatTimeFormatter} formatter
 * @since API version 2
 */
ControllerHost.prototype.setDefaultBeatTimeFormatter = function(formatter) {};

/**
 * Creates a {@link BeatTimeFormatter} that can be used to format beat times.
 *
 * @param separator
          the character used to separate the segments of the formatted beat time, typically ":", "." or
          "-"
 * @param barsLen
          the number of digits reserved for bars
 * @param beatsLen
          the number of digits reserved for beats
 * @param subdivisionLen
          the number of digits reserved for beat subdivisions
 * @param ticksLen
          the number of digits reserved for ticks
 * @return {BeatTimeFormatter}
 * @since API version 2
 */
ControllerHost.prototype.createBeatTimeFormatter = function(separator, barsLen, beatsLen, subdivisionLen, ticksLen) {};
