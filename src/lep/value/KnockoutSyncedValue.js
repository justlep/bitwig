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
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * @constructor
 */
lep.KnockoutSyncedValue = lep.util.extendClass(lep.BaseValue, {

    _init: function(opts) {
        this._super(opts);

        lep.util.assertDefined(opts.ownValue , 'Missing ownValue for {}', opts.name);
        lep.util.assertObservable(opts.refObservable, 'Missing refObservable for {}', opts.name);
        lep.util.assertFunctionOrEmpty(opts.onClick, 'Invalid onClick for {}', opts.name);

        var self = this;

        this.setInstanceVelocityValues(opts.velocityValueOn, opts.velocityValueOff);

        this.onClick = opts.onClick;
        this.refObservable = opts.refObservable;
        this.ownValue = opts.ownValue;
        this.value = (this.refObservable() === self.ownValue) ? this.velocityValueOn : this.velocityValueOff;

        this.toggleOnPressed = (opts.toggleOnPressed !== false);
        this.restoreRefAfterLongClick = !!opts.restoreRefAfterLongClick;

        if (this.restoreRefAfterLongClick) {
            lep.util.assert(this.toggleOnPressed, 'restoreRefAfterLongClick requires toggleOnPressed=true, {}', this.name);
            lep.util.assert(!this.onClick, 'restoreRefAfterLongClick is not supported in conjunction with onClick, {}', this.name);
        }

        this.refObservable.subscribe(function(newMode) {
            self.value = (newMode === self.ownValue) ? self.velocityValueOn : self.velocityValueOff;
            self.syncToController();
        });

    },

    setInstanceVelocityValues: function(onValueOrEmpty, offValueOrEmpty) {
        lep.util.assertNumberInRangeOrEmpty(onValueOrEmpty, 0, 127, 'Invalid onValueOrEmpty {} for {}', onValueOrEmpty, this.name);
        lep.util.assertNumberInRangeOrEmpty(offValueOrEmpty, 0, 127, 'Invalid offValueOrEmpty {} for {}', offValueOrEmpty, this.name);
        this.velocityValueOn = (typeof onValueOrEmpty === 'number') ? onValueOrEmpty : 127;
        this.velocityValueOff = (typeof offValueOrEmpty === 'number') ? offValueOrEmpty : 0;
    },

    /** The time in millis after which a button-press is considered a 'long click' */
    LONG_CLICK_TIME: 300,

    /** @Override */
    onRelativeValueReceived: lep.util.NOP,

    /** @Override */
    onAbsoluteValueReceived: function(absoluteValue) {
        var isPressed = !!absoluteValue,
            isReleaseAfterLongClick = (!isPressed && this.restoreRefAfterLongClick && lep.util.stopTimer(this.id) > this.LONG_CLICK_TIME);

        if (isReleaseAfterLongClick) {
            // only restore the refObservable if the refObservable still has the value it was given by this button
            if (this.refObservable() === this.ownValue && typeof this._savedRefValue !== 'undefined') {
                this.refObservable(this._savedRefValue);
                // lep.logDebug('KSV {} restoring old value {}', this.name, this._savedRefValue);
            }
            delete this._savedRefValue;
            return;
        }

        if (this.toggleOnPressed ^ isPressed) return;

        // from here we have the "toggle-now!" case

        if (this.onClick) {
            this.onClick(this.ownValue);
            return;
        }
        var isAlreadySelected = (this.refObservable() === this.ownValue);

        if (this.restoreRefAfterLongClick) {
            lep.util.startTimer(this.id);
            if (isAlreadySelected) {
                delete this._savedRefValue;
            } else {
                this._savedRefValue = this.refObservable();
            }
        }
        if (!isAlreadySelected) {
            this.refObservable(this.ownValue);
        }
    }
});