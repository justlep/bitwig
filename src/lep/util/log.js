var lep = (typeof lep !== 'undefined') ? lep : {};

/**
 * A simple logger working in both Bitwig + nodejs.
 *
 * Author: Lennart Pegel - https://github.com/justlep
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 *
 * Log level hierarchy is:  DEBUG < INFO < DEV < WARN < OFF
 *
 * "DEV" is meant for temporary use during development, just for easier focus on problematic code.
 *
 * Example:
 *      lep.setLogLevel(lep.LOGLEVEL.INFO);
 *      lep.logDebug('Test {}', 123); // --> does nothing
 *      lep.logInfo('Test {}', 123); // --> "Test 123"
 *      lep.logDev('Test {}', 123); //  --> "Test 123"
 *      lep.logWarn('Test {}', 123); // --> "Test 123"
 */
(function() {

    var loggingFn,
        NOP = function(){};

    if (typeof println === 'function') {
        loggingFn = function () {
            println(this.util.formatString.apply(this, arguments));
        }
    } else if (typeof console !== 'undefined' && typeof console.log === 'function') {
        loggingFn = function () {
            console.log(this.util.formatString.apply(this.util, arguments));
        }
    } else {
        loggingFn = function() {
            throw 'No logging method (console.log or println) was found!';
        };
    }

    /** @static */
    lep.LOGLEVEL = {
        DEBUG: 10,
        INFO: 20,
        DEV: 29,
        WARN: 30,
        OFF: 40
    };

    /** @static */
    lep.logDebug = loggingFn;
    /** @static */
    lep.logInfo = loggingFn;
    /** @static */
    lep.logDev = loggingFn;
    /** @static */
    lep.logWarn = loggingFn;

    /** @static */
    lep.setLogLevel = function(newLogLevel) {
        ['logDebug', 'logInfo','logDev','logWarn'].forEach(function(logMethodName) {
            var logLevelKey = logMethodName.toUpperCase().replace(/^LOG/, ''),
                isMethodEnabled = newLogLevel <= lep.LOGLEVEL[logLevelKey];
            lep[logMethodName] = (isMethodEnabled) ? loggingFn : NOP;
        });
    };

})();

