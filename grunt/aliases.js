module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('default', [
        'clean:bitwigApiSources',
        'copy:apiSourcesFromBitwig'
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

    grunt.registerTask('copyToBitwigForTest', [
        // 'clean:controllerScriptInBitwig',
        // 'validate',
        'copy:toBitwigForLiveTest'
    ]);

    grunt.registerTask('validate', [
        'jshint',
        'findDeprecatedApiCalls:latest'
    ]);

    grunt.registerTask('test', [
        'mochaTest'
    ]);
};