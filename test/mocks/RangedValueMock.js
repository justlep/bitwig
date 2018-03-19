/**
 * @constructor
 */
RangedValueMock = function() {
    let obs = ko.observable(0); // like ko.observable, RangedValue observers don't fire upon same-value "updates"

    /**
     * (!!) This does NOT behave exactly as it will in Bitwig:
     *      In Bitwig, the change-handler bound via {@link addValueObserver} is rate-limited / consolidated,
     *      so a change event may get fired only once during multiple, very fast subsequent calls of {@link set}.
     */
    this.set = function(newVal, range) {
        obs(newVal);
    };

    this.addValueObserver = function(range, fn) {
        obs.subscribe(fn);
    };

    this.setIndication = function(on) {
    };
};