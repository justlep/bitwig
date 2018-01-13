/* API Version - 2.2.3 */

/**
 * Bitwig Studio supports automatic visual feedback from controllers that shows up as popup notifications. For
 * example when the selected track or the current device preset was changed on the controller, these
 * notifications are shown, depending on the configuration.
 * 
 * It depends both on the users preference and the capabilities of the controller hardware if a certain
 * notification should be shown. This interface provides functions for enabling/disabling the various kinds of
 * automatic notifications from the hardware point of view. Typically, controllers that include an advanced
 * display don't need to show many notifications additionally on screen. For other controllers that do not
 * include a display it might be useful to show all notifications. By default all notifications are disabled.
 * 
 * In addition, the user can enable or disable all notifications the have been enabled using this interface in
 * the preferences dialog of Bitwig Studio.
 *
 * @since API version 1
 */
function NotificationSettings() {}

/**
 * Returns an object that reports if user notifications are enabled and that allows to enable/disable user
 * notifications from the control surface. If user notifications are disabled, no automatic notifications
 * will be shown in the Bitwig Studio user interface. If user notifications are enabled, all automatic
 * notifications will be shown that are enabled using the methods of this interface.
 *
 * @return {SettableBooleanValue} a boolean value object
 * @since API version 1
 */
NotificationSettings.prototype.getUserNotificationsEnabled = function() {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowSelectionNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowChannelSelectionNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowTrackSelectionNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowDeviceSelectionNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowDeviceLayerSelectionNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowPresetNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowMappingNotifications = function(shouldShowNotifications) {};

/**
 * Specifies if user notification related to selection changes should be shown. Please note that this
 * setting only applies when user notifications are enabled in general, otherwise no notification are
 * shown. By default this setting is `false`.
 *
 * @param shouldShowNotifications
          `true` in case selection notifications should be shown, `false` otherwise.
 * @since API version 1
 */
NotificationSettings.prototype.setShouldShowValueNotifications = function(shouldShowNotifications) {};
