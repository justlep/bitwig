module.exports = function (grunt, opts) {
    'use strict';

    return {
        options: {
            force: true
        },
        controllerScriptInBitwig: [opts.RELEASE_PATH_IN_BITWIG],
        target: ['tmp/target/*'],
        oldReleaseZip: [opts.VERSIONED_RELEASE_ZIP_PATH],
        bitwigApiSources: [opts.packageJson.lep.bitwigApiStubsPath + '/**/*.js']
    };
};