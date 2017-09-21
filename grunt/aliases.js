module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('default', [
        'validate'
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
        'compress:unmodifiedApiStubs',
        'purgePackagesFromApiStubs',
        'generateJshintConfig'
    ]);

    grunt.registerTask('copyToBitwigForTest', [
        // 'clean:controllerScriptInBitwig',
        // 'validate',
        'copy:toBitwigForLiveTest'
    ]);

    grunt.registerTask('validate', [
        'jshint'
    ]);

    grunt.registerTask('test', [
        'mochaTest:all'
    ]);
};