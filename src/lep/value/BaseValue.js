/**
 * Represents a single value than can be connected to both Bitwig and
 * a hardware controller's element (encoder and such) via BaseControl.js or subclass.
 *
 * @param opts (Object)
 *   - name (String)
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
lep.BaseValue = function(opts) {
    lep.util.assertString(opts.name, 'Missing name for BaseValue');

    this.id = lep.util.nextId();
    this.name = opts.name;

    this.value = opts.value || 0;
    this.controller = null;
};

lep.BaseValue.prototype = {
    setIndication:   lep.util.NOP,
    syncToDaw:       lep.util.NOP,

    syncToController: function() {
        if (this.controller) {
            this.controller.syncToMidi();
        }
    },
    onAttach: function(controller) {
        lep.util.assertBaseControl(controller, 'Invalid controller for BaseValue.onAttach()');
        this.controller = controller;
        this.syncToController();
        this.setIndication(true);
        lep.logDebug('Attached {} <> {}', this.controller.name, this.name);
    },
    onDetach: function() {
        // lep.logDebug('onDetach {}', this.name);
        if (this.controller) {
            lep.logDebug('Detached {} <> {}', this.controller.name, this.name);
            this.controller = null;
            this.setIndication(false);
        }
    },
    onRelativeValueReceived: function(delta, range) {
        lep.logDebug('{} onRelativeChange({},{})', this.id, delta, range);
    },
    onAbsoluteValueReceived: function(absoluteValue) {
        this.value = absoluteValue;
        this.syncToDaw();
    }
};