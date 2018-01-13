/* API Version - 2.2.3 */

function SysexBuilder() {}

/**
 * @param {string} hexString
 * @return {SysexBuilder}
 */
SysexBuilder.prototype.fromHex = function(hexString) {};

/**
 * @param {int} value
 * @return {SysexBuilder}
 */
SysexBuilder.prototype.addByte = function(value) {};

/**
 * @param {string} string
 * @param {int} length
 * @return {SysexBuilder}
 */
SysexBuilder.prototype.addString = function(string, length) {};

/**
 * @param {byte[]} bytes
 * @return {SysexBuilder}
 */
SysexBuilder.prototype.add = function(bytes) {};

/**
 * @param {string} hex
 * @return {SysexBuilder}
 */
SysexBuilder.prototype.addHex = function(hex) {};

/**
 * @return {byte[]}
 */
SysexBuilder.prototype.terminate = function() {};

/**
 * @return {byte[]}
 */
SysexBuilder.prototype.array = function() {};
