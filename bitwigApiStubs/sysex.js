
function printSysex(data)
{
   println("Sysex: " + prettyHex(data));
}

function uint8ToHex(x)
{
   var upper = (x >> 4) & 0xF;
   var lower = x & 0xF;

   return upper.toString(16) + lower.toString(16) + " ";
}

function uint7ToHex(x)
{
   var upper = (x >> 4) & 0x7;
   var lower = x & 0xF;

   return upper.toString(16) + lower.toString(16) + " ";
}

/** Get the integer value of a byte in a hex-string (index is bytes, not hex characters) **/
String.prototype.hexByteAt = function (byteIndex)
{
   var hex = this.cleanupHex();
   return parseInt(hex.substr(byteIndex*2, 2), 16);
}

function asciiCharToHex(c)
{
   var charcode = c.charCodeAt(0);

   var upper = (charcode >> 4) & 0xF;
   var lower = charcode & 0xF;

   return upper.toString(16) + lower.toString(16) + " ";
}

/**
 * Return the contents of the string encoded as hex, intended for sending SysEx.
 * @param {int} len Length in bytes of the resulting hex-encoded string
 * @return {string}
 */
String.prototype.toHex = function(len)
{
   var text = this.forceLength(len);

   var result = "";

   for(i=0; i<len; i++)
   {
      result += asciiCharToHex(text.charAt(i));
   }

   return result;
}

/** Clean-up hex code to a lower-case variant with no whitespace. **/
String.prototype.cleanupHex = function()
{
   var hex = this.replace(" ", "", "g");
   hex = hex.toLowerCase();
   return hex;
}

/** Check if the hex string mathces a pattern,
 * (which can contain either hex characters or the ? wildcard)
 * @return boolean
 */

String.prototype.matchesHexPattern = function(pattern)
{
   // remove spaces and conver-to lower case
   var hex = this.cleanupHex();
   pattern = pattern.cleanupHex();

   if (hex.length != pattern.length)
   {
      return false;
   }

   for(i=0; i<hex.length; i++)
   {
      if (pattern.charAt(i) != "?" && pattern.charAt(i) != hex.charAt(i))
      {
         return false;
      }
   }

   return true;
}

/**
 * Clean-up hex for printing (groups bytes as pairs, upper case).
 * @return {string}
 */
function prettyHex(hex)
{
   hex = hex.replace(" ", "", "g"); // remove spaces

   var result = "";
   var first = true;
   for(i=0; i<hex.length; i+=2)
   {
      if (!first)
      {
         result += " ";
      }

      result += hex.substr(i, 2);
      first = false;
   }

   return result.toUpperCase();
}