
/** Make a string a specific length, truncating the string or padding it with 'padding' if necessary.
 (padding is optional, will use spaces if not)
 **/
String.prototype.forceLength = function(length, padding)
{
   if (this.length == length)
   {
      return this;
   }

   if (this.length > length)
   {
      return this.substr(0, length);
   }

   if(padding === undefined)
   {
      padding = " ";
   }

   var str = this;

   while (str.length < length)
   {
      str = str + padding;
   }

   return str;
}

String.prototype.forceLengthCentered = function(length, padding)
{
   if (this.length == length)
   {
      return this;
   }

   if (this.length > length)
   {
      return this.substr(0, length);
   }

   if(padding === undefined)
   {
      padding = " ";
   }

   var missing = length - this.length;
   var before = Math.floor(missing / 2);
   var after = missing - before;

   return padding.repeat(before) + this + padding.repeat(after);
}

String.prototype.beginsWith = function(other)
{
   if (other.length > this.length)
   {
      return false;
   }

   return this.substr(0, other.length) == other;
}

/**
 * Repeat a string `n`-times (recursive)
 * @param {Number} n - The times to repeat the string.
 * @param {String} d - A delimiter between each string.
 */

String.prototype.repeat = function (n, d) {
    return --n ? this + (d || "") + this.repeat(n, d) : "" + this;
};

/** Convert an unsigned 7-bit value (MIDI-style) to a signed value (twos-complement) **/
function uint7ToInt7(x)
{
   if (x >= 64)
   {
      return x - 128;
   }
   return x;
}

function singMagnitudeToInt7(x)
{
   if (x >= 64)
   {
      return -(x & 0x3F);
   }
   return (x & 0x3F);
}

/**
  * @return {Boolean}
 */
function withinRange(val, low, high)
{
   return (val >= low) && (val <= high);
}

/**
 * Initialize an array with value repeated length times.
 */

function initArray(value, length) {
   var arr = [], i = 0;
   arr.length = length;
   while (i < length) { arr[i++] = value; }
   return arr;
}

function areArraysEqual(a, b)
{
   return !(a < b || b < a);
}

function dump(obj)
{
   println(obj);
   for(var key in obj)
   {
      println(key);
   }
}

function makeIndexedFunction(index, f)
{
   return function (value)
   {
      f(+index, value);
   };
}

/** Utility function that can avoid the bug where the Device.addPageNamesObserver in API version 1 
    sent the page names as the arguments to the function instead of as one argument containing the array.
    Scripts that use this to add the observer will be compatiable with v1 and v2 of the API. */
function addPageNamesObserver(device, observer)
{
	if (host.getHostApiVersion() == 1)
	{
		device.addPageNamesObserver(function ()
			{
				pageNames = arguments;
				observer(pageNames);
			});
	}
	else
	{
		device.addPageNamesObserver(observer);
	}
}
