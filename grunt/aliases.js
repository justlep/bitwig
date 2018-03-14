module.exports = function (grunt, opts) {

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
        'updateEslintConfig'
    ]);

    grunt.registerTask('copyToBitwigForTest', [
        // 'clean:controllerScriptInBitwig',
        // 'validate',
        'copy:toBitwigForLiveTest'
    ]);

    grunt.registerTask('validate', [
        'exec:lint'
    ]);

    grunt.registerTask('test', [
        'mochaTest:all'
    ]);
};