/* API Version - 2.3.1 */

/**
 * This class represents an RGBA color with each component being stored as double.
 *
 * @since API version 5
 */
function Color() {}

/**
 * @param {double} red
 * @param {double} green
 * @param {double} blue
 * @return {Color}
 */
Color.prototype.fromRGB = function(red, green, blue) {};

/**
 * @param {double} red
 * @param {double} green
 * @param {double} blue
 * @param {double} alpha
 * @return {Color}
 */
Color.prototype.fromRGBA = function(red, green, blue, alpha) {};

/**
 * @param {int} red
 * @param {int} green
 * @param {int} blue
 * @return {Color}
 */
Color.prototype.fromRGB255 = function(red, green, blue) {};

/**
 * @param {int} red
 * @param {int} green
 * @param {int} blue
 * @param {int} alpha
 * @return {Color}
 */
Color.prototype.fromRGBA255 = function(red, green, blue, alpha) {};

/**
 * @param {string} hex
 * @return {Color}
 */
Color.prototype.fromHex = function(hex) {};

/**
 * Mixes two colors.
 *
 * @param {Color} c1
 * @param {Color} c2
 * @param {double} blend
 * @return {Color}
 * @since API version 4
 */
Color.prototype.mix = function(c1, c2, blend) {};

/**
 * @return {Color}
 */
Color.prototype.nullColor = function() {};

/**
 * @return {Color}
 */
Color.prototype.blackColor = function() {};

/**
 * @return {Color}
 */
Color.prototype.whiteColor = function() {};

/**
 * @return {double}
 */
Color.prototype.getRed = function() {};

/**
 * @return {double}
 */
Color.prototype.getGreen = function() {};

/**
 * @return {double}
 */
Color.prototype.getBlue = function() {};

/**
 * @return {double}
 */
Color.prototype.getAlpha = function() {};

/**
 * @return {int}
 */
Color.prototype.getRed255 = function() {};

/**
 * @return {int}
 */
Color.prototype.getGreen255 = function() {};

/**
 * @return {int}
 */
Color.prototype.getBlue255 = function() {};

/**
 * @return {int}
 */
Color.prototype.getAlpha255 = function() {};
