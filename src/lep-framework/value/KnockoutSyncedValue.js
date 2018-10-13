/**
 * A special type of BaseValue which represents one const value (ownValue) that a given refObservable can take on.
 * The numerical value of a KnockoutSyncedValue is 127 if 'ownValue' equals the current value of the refObservable, otherwise 0.
 * I.e., the KnockoutSyncedValue is "active" if its ownValue matches the refObservable.
 *
 * The Value can be configured (opts.restoreRefAfterLongClick) to automatically revert its change to the refObservable
 * after holding the respective button down for distinctly longer than a click-time, see {@link LONG_CLICK_TIME}.
 *
 * On receiving an absolute value > 0, one of two things happen:
 *    - if the onClick callback is given, it is invoked
 *    - if NO onClick is given, the refObservable is set to ownValue
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 * @extends {lep.BaseValue}
 */
lep.KnockoutSyncedValue = lep.util.extendClass(lep.BaseValue, {
    /**
     * @param {Object} opts - same as {@link BaseValue}, plus
     * @param {*} opts.ownValue - the constant value this KSV instance represents
     * @param {ko.observable} opts.refObservable - the Knockout observable holding the reference value to compare `ownValue` to
     * @param {number} [opts.velocityValueOn] - optional midi velocity value to send if ownValue equals refObservable
     * @param {number} [opts.velocityValueOff] - optional midi velocity value to send if ownValue !equals refObservable
     * @param {(Function|ko.observable)} [opts.computedVelocity] - a function returning the velocity value to send to the controller.
*                                                                  If given, `velocityValueOn` and `velocityValueOff` are ignored.
     * @param {ko.observable} [opts.ignoreClickIf] - if given, the `click` event, e.g. function(){..}()
     * @param {boolean} [opts.forceRewrite=false] - if true, the refObservable will be written with `ownValue` even if it already has that value
     * @param {KnockoutSyncedValue~ClickHandler} [opts.onClick] - optional function to call when an absolute value > 0 is received,
     *                                                            e.g. function(ownVal, refObs) {..}
     * @param {boolean} [opts.doubleClickAware] - if true, the onClick handler gets passed an additional parameter for the `isDoubleClick` flag
     * @param {boolean} [opts.restoreRefAfterLongClick] - if true, the refObservable value will be restored to the value
     *                                                    it had before this KSV instance pushed its ownValue into it, but only if
     *                                                    the click-release-timespan exceeds {@link #LONG_CLICK_TIME}
     * @param {boolean} [opts.isOnClickRestoreable] - double-confirmation flag indicating that a given onClick handler
     *                                            was check to work nicely together with `restoreRefAfterLongClick` mechanism,
     *                                            i.e. the `onClick` handler updates the refObservable() with ownValue
     * @extends {lep.BaseValue}
     * @constructs
     **/
    _init: function(opts) {
        this._super(opts);

        lep.util.assertDefined(opts.ownValue , 'Missing ownValue for {}', opts.name);
        lep.util.assertObservable(opts.refObservable, 'Missing refObservable for {}', opts.name);
        lep.util.assertFunctionOrEmpty(opts.onClick, 'Invalid onClick for {}', opts.name);
        lep.util.assertFunctionOrEmpty(opts.computedVelocity, 'Invalid computedVelocity for {}', opts.name);
        lep.util.assertNumberInRangeOrEmpty(opts.velocityValueOn, 0, 127, 'Invalid velocityValueOn {} for {}', opts.velocityValueOn, this.name);
        lep.util.assertNumberInRangeOrEmpty(opts.velocityValueOff, 0, 127, 'Invalid velocityValueOff {} for {}',
                                            opts.velocityValueOff, this.name);
        lep.util.assertFunctionOrEmpty(this.ignoreClickIf, 'Invalid ignoreClickIf for {}', this.name);

        var self = this,
            initDone = false;

        if (opts.computedVelocity) {
            lep.util.assert(typeof opts.velocityValueOn === 'undefined' && typeof opts.velocityValueOn === 'undefined',
                            'Given computedVelocity overrides velocityValueOn/velocityValueOff in {}', this.name);
            this.computedVelocity = opts.computedVelocity.bind(this);
        } else {
            this.velocityValueOn = (typeof opts.velocityValueOn === 'number') ? opts.velocityValueOn : 127;
            this.velocityValueOff = (typeof opts.velocityValueOff === 'number') ? opts.velocityValueOff : 0;
        }

        this.onClick = opts.onClick;
        this.doubleClickAware = !!this.onClick && opts.doubleClickAware;

        this.refObservable = opts.refObservable;
        this.ownValue = opts.ownValue;
        this.value = null;

        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.restoreRefAfterLongClick = !!opts.restoreRefAfterLongClick;
        this.ignoreClickIf = opts.ignoreClickIf;
        this.forceRewrite = !!opts.forceRewrite;

        /**
         * @type {number} the timestamp when the last click event occurred
         * @private
         */
        this._lastClickTime = 0;

        if (this.restoreRefAfterLongClick) {
            lep.util.assert(this.toggleOnPressed, 'restoreRefAfterLongClick requires toggleOnPressed=true, {}', this.name);
            lep.util.assert(!this.onClick || opts.isOnClickRestoreable,
                'Combined use of onClick + restoreRefAfterLongClick requires the isOnClickRestoreable flag to be explicitly set, {}', this.name);
        }

        ko.computed(function() {
            self.value = (opts.computedVelocity) ? opts.computedVelocity() :
                         (self.refObservable() === self.ownValue) ? self.velocityValueOn : self.velocityValueOff;

            if (initDone) {
                self.syncToController();
            } else {
                initDone = true;
            }
        });
    },

    /** The time in millis after which a button-press is considered a 'long click' */
    LONG_CLICK_TIME: 300,

    /** @override */
    onRelativeValueReceived: lep.util.NOP,

    /**
     * @return {boolean} true if {@link _lastClickTime} is longer ago than {@link LONG_CLICK_TIME}
     * @private
     */
    _checkAndResetLongClick: function() {
        var now = Date.now(),
            diff = now - (this._lastClickTime || (now + 1)),
            isLongClick = diff > this.LONG_CLICK_TIME;

        this._lastClickTime = 0;
        return isLongClick;
    },

    /** @override */
    onAbsoluteValueReceived: function(absoluteValue /*, isTakeoverRequired */) {
        if (this.ignoreClickIf && this.ignoreClickIf()) {
            this._lastClickTime = 0;
            return;
        }

        var isPressed = !!absoluteValue,
            currentRefValue = this.refObservable.peek(),
            ownValueEqualsRef = currentRefValue === this.ownValue,
            isReleaseAfterLongClick = !isPressed && this.restoreRefAfterLongClick && this._checkAndResetLongClick(),
            skipWriteRef = false;

        // lep.logDev('---------\nisPressed: {},\ncurrentRefValue: {},\nisReleaseAfterLongClick: {}\nownValueEqualsRef: {}\n-------------',
        //     isPressed,
        //     currentRefValue && currentRefValue.name,
        //     isReleaseAfterLongClick,
        //     ownValueEqualsRef
        // );

        if (!isPressed) {
            if (isReleaseAfterLongClick && typeof this._savedRefValue !== 'undefined') {
                this.refObservable(this._savedRefValue);
                // lep.logDebug('KSV {} restored old value {}', this.name, this._savedRefValue);
            }
            delete this._savedRefValue;
        }

        if (this.toggleOnPressed !== isPressed) {
            return;
        }

        // from now we have the "toggle-now!" case

        if (this.onClick) {
            skipWriteRef = true;

            var isDoubleClick = false,
                clickTimeNow;

            if (this.doubleClickAware) {
                clickTimeNow = Date.now();
                if (clickTimeNow < (this._maxNextDoubleClickTime || 0)) {
                    isDoubleClick = true;
                } else {
                    // doubleclick time of 400 milliseconds should be sufficient
                    this._maxNextDoubleClickTime = clickTimeNow + 400;
                }
            }
            this.onClick(this.ownValue, this.refObservable, isDoubleClick);
        }

        if (this.restoreRefAfterLongClick) {
            this._lastClickTime = Date.now();
            this._savedRefValue = currentRefValue;
        }

        if (!skipWriteRef && (!ownValueEqualsRef || this.forceRewrite)) {
            this.refObservable(this.ownValue);
        }
    }
});

/**
 * @callback KnockoutSyncedValue~ClickHandler
 * @param {*} ownValue
 * @param {ko.observable} refObservable
 * @param {boolean} isDoubleClick - only set if opts.doubleClickAware was true
 */

