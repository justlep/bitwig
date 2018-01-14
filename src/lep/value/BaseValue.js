/**
 * Base class representing a single value than can be connected to both Bitwig and
 * a hardware controller's element (encoder and such) via BaseControl.js or subclass.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @param {Object} opts
 * @param {string} opts.name - a speaking name for this instance
 * @param {*} [opts.value=0] - an underlying value that this BaseValue should wrap
 * @constructor
 */
lep.BaseValue = function(opts) {
    lep.util.assertString(opts.name, 'Missing name for BaseValue');

    this.id = lep.util.nextId();
    this.name = opts.name;

    this.value = opts.value || 0;

    /** @type {lep.BaseControl} */
    this.controller = null;
};

lep.BaseValue.prototype = {
    setIndication:   lep.util.NOP,
    afterDetach: lep.util.NOP,

    syncToController: function() {
        if (this.controller && this.controller.isBidirectional) {
            this.controller.syncToMidi();
        }
    },
    /**
     * @param {lep.BaseControl} controller
     * @final
     */
    onAttach: function(controller) {
        lep.util.assertBaseControl(controller, 'Invalid controller for BaseValue.onAttach()');
        this.controller = controller;
        this.syncToController();
        this.setIndication(true);
        lep.logDebug('Attached value {} -> {}', this.name, this.controller.name);
    },
    /** @final */
    onDetach: function() {
        // lep.logDebug('onDetach {}', this.name);
        if (this.controller) {
            lep.logDebug('Detached value {} <- {}', this.name, this.controller.name);
            this.controller = null;
            this.setIndication(false);
            this.afterDetach();
        }
    },
    onRelativeValueReceived: function(delta, range) {
        lep.logDebug('{} onRelativeChange({},{})', this.id, delta, range);
    },
    onAbsoluteValueReceived: function(absoluteValue, isTakeoverRequired) {
        this.value = absoluteValue;
        // a subclass must sync the change value to Bitwig (taking into account `isTakeoverRequired` for unidirectional controls)
    }
};
