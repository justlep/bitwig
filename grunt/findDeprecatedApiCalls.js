module.exports = function (grunt, opts) {

    'use strict';

    const REFERENCE_API = require('./../grunt-tasks/findDeprecatedApiCalls').REFERENCE_API;

    return {
        options: {
            files: ['src/**/*.js', '!src/lib/**']
        },
        latestInRepo: {
            referenceApi: REFERENCE_API.LATEST_IN_REPO
        },
        localBitwig: {
            referenceApi: REFERENCE_API.LOCAL_BITWIG_INSTALLATION
        }
    };
};