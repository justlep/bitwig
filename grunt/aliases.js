module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('default', [
        'updateApiStubs'
    ]);

    grunt.registerTask('buildStableRelease', [
        'validate',
        'test',
        'clean:target',
        'clean:oldReleaseZip',
        'copy:sourcesToTarget',
        'copy:historyToTarget',
        'generateInfoTxtInTarget',
        'compress:zipTargetToRelease',
        'clean:target'
    ]);

    grunt.registerTask('updateApiStubs', [
        'clean:bitwigApiSources',
        'copy:apiSourcesFromBitwig',
        'purgePackagesFromApiStubs'
    ]);

    grunt.registerTask('copyToBitwigForTest', [
        // 'clean:controllerScriptInBitwig',
        // 'validate',
        'copy:toBitwigForLiveTest'
    ]);

    grunt.registerTask('validate', [
        'jshint'
        //'findDeprecatedApiCalls:latestInRepo'
    ]);

    grunt.registerTask('updateDeprecationsInfo', [
        'findDeprecatedApiCalls:localBitwig'
    ]);

    grunt.registerTask('test', [
        'mochaTest'
    ]);
};