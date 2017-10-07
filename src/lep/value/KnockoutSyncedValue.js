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
 * @params opts (Object) same as {@link BaseValue}, plus
 *          - ownValue (mixed) the constant value represented by this KnockoutSyncedValue
 *          - refObservable (Observable) the Knockout Observable holding the reference value to compare ownValue to
 *          - [onClick] (function) (optional) function to call when an absolute value > 0 is received
 *          - [velocityValueOn] (number) (optional) velo midi value to send if ownValue matches refObservable
 *          - [velocityValueOff] (number) (optional) velo midi value to send if ownValue matches refObservable
 *          - [computedVelocity] (function|Observable) (optional) function returning the velocity value to send to the controller
 *            (!) If computedVelocity is given, it overrides any given velocityValueOn/velocityValueOff value.
 *          - [ignoreClickIf] (observable) if given, the `click` event
 *          - [forceRewrite] (boolean) if true, the refObservable will be written with `ownValue` even if it already has that value
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.KnockoutSyncedValue = lep.util.extendClass(lep.BaseValue, {

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
        this.refObservable = opts.refObservable;
        this.ownValue = opts.ownValue;
        this.value = null;

        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.restoreRefAfterLongClick = !!opts.restoreRefAfterLongClick;
        this.ignoreClickIf = opts.ignoreClickIf;
        this.forceRewrite = !!opts.forceRewrite;

        if (this.restoreRefAfterLongClick) {
            lep.util.assert(this.toggleOnPressed, 'restoreRefAfterLongClick requires toggleOnPressed=true, {}', this.name);
            lep.util.assert(!this.onClick, 'restoreRefAfterLongClick is not supported in conjunction with onClick, {}', this.name);
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

    skipRestore: function() {
        delete this._savedRefValue;
    },

    /** The time in millis after which a button-press is considered a 'long click' */
    LONG_CLICK_TIME: 300,

    /** @Override */
    onRelativeValueReceived: lep.util.NOP,

    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue /*, isTakeoverRequired */) {
        if (this.ignoreClickIf && this.ignoreClickIf()) {
            lep.util.stopTimer(this.id, true);
            return;
        }

        var isPressed = !!absoluteValue,
            isReleaseAfterLongClick = (!isPressed && this.restoreRefAfterLongClick && lep.util.stopTimer(this.id, true) > this.LONG_CLICK_TIME);

        if (isReleaseAfterLongClick) {
            // only restore the refObservable if the refObservable still has the value it was given by this button
            if (this.refObservable() === this.ownValue && typeof this._savedRefValue !== 'undefined') {
                this.refObservable(this._savedRefValue);
                // lep.logDebug('KSV {} restoring old value {}', this.name, this._savedRefValue);
            }
            return this.skipRestore();
        }

        if (this.toggleOnPressed !== isPressed) {
            return;
        }

        // from here we have the "toggle-now!" case

        if (this.onClick) {
            this.onClick(this.ownValue);
            return;
        }
        var isAlreadySelected = (this.refObservable() === this.ownValue);

        if (this.restoreRefAfterLongClick) {
            lep.util.startTimer(this.id);
            if (isAlreadySelected) {
                this.skipRestore();
            } else {
                this._savedRefValue = this.refObservable();
            }
        }
        if (!isAlreadySelected || this.forceRewrite) {
            this.refObservable(this.ownValue);
        }
    }
});