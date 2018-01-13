/* API Version - 2.2.3 */

/**
 * This interface represents a device in Bitwig Studio, both internal devices and plugins.
 *
 * @since API version 1
 */
function Device() {}

Device.prototype = new ObjectProxy();
Device.prototype.constructor = Device;

/**
 * Returns a representation of the device chain that contains this device. Possible device chain instances
 * are tracks, device layers, drums pads, or FX slots.
 *
 * @return {DeviceChain} the requested device chain object
 * @since API version 1
 */
Device.prototype.getDeviceChain = function() {};

/**
 * Value that reports the position of the device within the parent device chain.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
Device.prototype.position = function() {};

/**
 * Returns an object that provides access to the open state of plugin windows.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the open state of the editor window, in case the device
        features a custom editor window (such as plugins).
 * @since API version 1
 */
Device.prototype.isWindowOpen = function() {};

/**
 * Returns an object that provides access to the expanded state of the device.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the expanded state of the device.
 * @since API version 1
 */
Device.prototype.isExpanded = function() {};

/**
 * Returns an object that provides access to the visibility of the device remote controls section.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the remote controls section visibility.
 * @since API version 2
 */
Device.prototype.isRemoteControlsSectionVisible = function() {};

/**
 * Creates a cursor for the selected remote controls page in the device with the supplied number of
 * parameters. This section will follow the current page selection made by the user in the application.
 *
 * @param parameterCount
          The number of parameters the remote controls should contain
 * @return {CursorRemoteControlsPage}
 * @since API version 2
 */
Device.prototype.createCursorRemoteControlsPage = function(parameterCount) {};

/**
 * Creates a cursor for a remote controls page in the device with the supplied number of parameters. This
 * section will be independent from the current page selected by the user in Bitwig Studio's user
 * interface. The supplied filter is an expression that can be used to match pages this section is
 * interested in. The expression is matched by looking at the tags added to the pages. If the expression is
 * empty then no filtering will occur.
 *
 * @param name
          A name to associate with this section. This will be used to remember manual mappings made by
          the user within this section.
 * @param parameterCount
          The number of parameters the remote controls should contain
 * @param filterExpression
          An expression used to match pages that the user can navigate through. For now this can only be
          the name of a single tag the pages should contain (e.g "drawbars", "dyn", "env", "eq",
          "filter", "fx", "lfo", "mixer", "osc", "overview", "perf").
 * @return {CursorRemoteControlsPage}
 * @since API version 2
 */
Device.prototype.createCursorRemoteControlsPage = function(name, parameterCount, filterExpression) {};

/**
 * Selects the device in Bitwig Studio.
 *
 * @since API version 1
 */
Device.prototype.selectInEditor = function() {};

/**
 * Value that reports if the device is a plugin.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Device.prototype.isPlugin = function() {};

/**
 * Switches to the previous parameter page.
 *
 * @since API version 1
 */
Device.prototype.previousParameterPage = function() {};

/**
 * Switches to the next parameter page.
 *
 * @since API version 1
 */
Device.prototype.nextParameterPage = function() {};

/**
 * Registers an observer that reports if there is a previous parameter page.
 *
 * @param callback
          a callback function that receives a single boolean parameter
 * @since API version 1
 */
Device.prototype.addPreviousParameterPageEnabledObserver = function(callback) {};

/**
 * Registers an observer that reports if there is a next parameter page.
 *
 * @param callback
          a callback function that receives a single boolean parameter
 * @since API version 1
 */
Device.prototype.addNextParameterPageEnabledObserver = function(callback) {};

/**
 * Switches to the parameter page at the given page index.
 *
 * @param page
          the index of the desired parameter page
 * @since API version 1
 */
Device.prototype.setParameterPage = function(page) {};

/**
 * Returns an object used for browsing devices, presets and other content. Committing the browsing session
 * will load or create a device from the selected resource and replace the current device.
 *
 * @param numFilterColumnEntries
          the size of the window used to navigate the filter column entries.
 * @param numResultsColumnEntries
          the size of the window used to navigate the results column entries.
 * @return {Browser} the requested device browser object.
 * @since API version 1
 */
Device.prototype.createDeviceBrowser = function(numFilterColumnEntries, numResultsColumnEntries) {};

/**
 * Value that reports the name of the device.
 *
 * @return {StringValue}
 * @since API version 2
 */
Device.prototype.name = function() {};

/**
 * Value that reports the last loaded preset name.
 *
 * @return {StringValue}
 * @since API version 2
 */
Device.prototype.presetName = function() {};

/**
 * Value that reports the current preset category name.
 *
 * @return {StringValue}
 * @since API version 2
 */
Device.prototype.presetCategory = function() {};

/**
 * Value that reports the current preset creator name.
 *
 * @return {StringValue}
 * @since API version 2
 */
Device.prototype.presetCreator = function() {};

/**
 * Registers an observer that reports the currently selected parameter page.
 *
 * @param valueWhenUnassigned
          the default page index that gets reported when the device is not associated with a device
          instance in Bitwig Studio yet.
 * @param callback
          a callback function that receives a single page index parameter (integer)
 * @since API version 1
 */
Device.prototype.addSelectedPageObserver = function(valueWhenUnassigned, callback) {};

/**
 * Registers an observer that reports the name of the active modulation source.
 *
 * @param len
          the maximum length of the name. Longer names will get truncated.
 * @param textWhenUnassigned
          the default name that gets reported when the device is not associated with a Bitwig Studio
          device yet.
 * @param callback
          a callback function that receives a single name parameter (string)
 * @since API version 1
 */
Device.prototype.addActiveModulationSourceObserver = function(len, textWhenUnassigned, callback) {};

/**
 * Registers an observer that reports the names of the devices parameter pages.
 *
 * @param callback
          a callback function that receives a single string array parameter containing the names of the
          parameter pages
 * @since API version 1
 */
Device.prototype.addPageNamesObserver = function(callback) {};

/**
 * Value that reports if the device is enabled.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
Device.prototype.isEnabled = function() {};

/**
 * Indicates if the device has nested device chains in FX slots. Use {@link #addSlotsObserver(Callable)
 * addSlotsObserver(Callable)} to get a list of available slot names, and navigate to devices in those
 * slots using the {@link CursorDevice} interface.
 *
 * @return {BooleanValue} a value object that indicates if the device has nested device chains in FX slots.
 * @since API version 1
 */
Device.prototype.hasSlots = function() {};

/**
 * Value of the list of available FX slots in this device.
 *
 * @return {StringArrayValue}
 * @since API version 2
 */
Device.prototype.slotNames = function() {};

/**
 * Returns an object that represents the selected device slot as shown in the user interface, and that
 * provides access to the contents of slot's device chain.
 *
 * @return {DeviceSlot} the requested slot cursor object
 * @since API version 1
 */
Device.prototype.getCursorSlot = function() {};

/**
 * Indicates if the device is contained by another device.
 *
 * @return {BooleanValue} a value object that indicates if the device is nested
 * @since API version 1
 */
Device.prototype.isNested = function() {};

/**
 * Indicates if the device supports nested layers.
 *
 * @return {BooleanValue} a value object that indicates if the device supports nested layers.
 * @since API version 1
 */
Device.prototype.hasLayers = function() {};

/**
 * Indicates if the device has individual device chains for each note value.
 *
 * @return {BooleanValue} a value object that indicates if the device has individual device chains for each note value.
 * @since API version 1
 */
Device.prototype.hasDrumPads = function() {};

/**
 * Create a bank for navigating the nested layers of the device using a fixed-size window.
 *
 * @param numChannels
          the number of channels that the device layer bank should be configured with
 * @return {DeviceLayerBank} a device layer bank object configured with the desired number of channels
 * @since API version 1
 */
Device.prototype.createLayerBank = function(numChannels) {};

/**
 * Create a bank for navigating the nested layers of the device using a fixed-size window.
 *
 * @param numPads
          the number of channels that the drum pad bank should be configured with
 * @return {DrumPadBank} a drum pad bank object configured with the desired number of pads
 * @since API version 1
 */
Device.prototype.createDrumPadBank = function(numPads) {};

/**
 * Returns a device layer instance that can be used to navigate the layers or drum pads of the device, in
 * case it has any.
 *
 * @return {CursorDeviceLayer} a cursor device layer instance
 * @since API version 1
 */
Device.prototype.createCursorLayer = function() {};

/**
 * Adds an observer on a list of all parameters for the device.
 * 
 * The callback always updates with an array containing all the IDs for the device.
 *
 * @param callback
          function with the signature (String[])
 * @since API version 1
 */
Device.prototype.addDirectParameterIdObserver = function(callback) {};

/**
 * Adds an observer for the parameter names (initial and changes) of all parameters for the device.
 *
 * @param maxChars
          maximum length of the string sent to the observer.
 * @param callback
          function with the signature (String ID, String name)
 * @since API version 1
 */
Device.prototype.addDirectParameterNameObserver = function(maxChars, callback) {};

/**
 * Returns an observer that reports changes of parameter display values, i.e. parameter values formatted as
 * a string to be read by the user, for example "-6.02 dB". The returned observer object can be used to
 * configure which parameters should be observed. By default no parameters are observed. It should be
 * avoided to observe all parameters at the same time for performance reasons.
 *
 * @param maxChars
          maximum length of the string sent to the observer.
 * @param callback
          function with the signature (String ID, String valueDisplay)
 * @return {DirectParameterValueDisplayObserver} an observer object that can be used to enable or disable actual observing for certain
        parameters.
 * @since API version 1
 */
Device.prototype.addDirectParameterValueDisplayObserver = function(maxChars, callback) {};

/**
 * Adds an observer for the parameter display value (initial and changes) of all parameters for the device.
 *
 * @param callback
          a callback function with the signature (String ID, float normalizedValue). If the value is not
          accessible 'Number.NaN' (not-a-number) is reported, can be checked with 'isNaN(value)'.
 * @since API version 1
 */
Device.prototype.addDirectParameterNormalizedValueObserver = function(callback) {};

/**
 * Sets the parameter with the specified `id` to the given `value` according to the given `resolution`.
 *
 * @param id
          the parameter identifier string
 * @param value
          the new value normalized to the range [0..resolution-1]
 * @param resolution
          the resolution of the new value
 * @since API version 1
 */
Device.prototype.setDirectParameterValueNormalized = function(id, value, resolution) {};

/**
 * Increases the parameter with the specified `id` by the given `increment` according to the given
 * `resolution`. To decrease the parameter value pass in a negative increment.
 *
 * @param id
          the parameter identifier string
 * @param increment
          the amount that the parameter value should be increased by, normalized to the range
          [0..resolution-1]
 * @param resolution
          the resolution of the new value
 * @since API version 1
 */
Device.prototype.incDirectParameterValueNormalized = function(id, increment, resolution) {};

/**
 * Value that reports the file name of the currently loaded sample, in case the device is a sample
 * container device.
 *
 * @return {StringValue}
 * @since API version 2
 */
Device.prototype.sampleName = function() {};

/**
 * Returns an object that provides bank-wise navigation of sibling devices of the same device chain
 * (including the device instance used to create the siblings bank).
 *
 * @param numDevices
          the number of devices that are simultaneously accessible
 * @return {DeviceBank} the requested device bank object
@since API version 1
 */
Device.prototype.createSiblingsDeviceBank = function(numDevices) {};

/**
 * Starts browsing for content that can be inserted before this device in Bitwig Studio's popup browser.
 *
 * @since API version 2
 */
Device.prototype.browseToInsertBeforeDevice = function() {};

/**
 * Starts browsing for content that can be inserted before this device in Bitwig Studio's popup browser.
 *
 * @since API version 2
 */
Device.prototype.browseToInsertAfterDevice = function() {};

/**
 * Starts browsing for content that can replace this device in Bitwig Studio's popup browser.
 *
 * @since API version 2
 */
Device.prototype.browseToReplaceDevice = function() {};
