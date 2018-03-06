/* API Version - 2.3.1 */

function StepDataChangedCallback() {}

StepDataChangedCallback.prototype = new Callback();
StepDataChangedCallback.prototype.constructor = StepDataChangedCallback;

/**
 * A callback function that receives three parameters: 1. the x (step) coordinate within the note grid
 * (integer), 2. the y (key) coordinate within the note grid (integer), and 3. an integer value that
 * indicates if the step is empty (`0`) or if a note continues playing (`1`) or starts playing (`2`).
 *
 * @param {int} x
 * @param {int} y
 * @param {int} state
 */
StepDataChangedCallback.prototype.stepStateChanged = function(x, y, state) {};
