module.exports = function (grunt, opts) {
    'use strict';

    return {
        sourcesToTarget: {
            files: [
                {
                    cwd: './src',
                    src: ['**/*.js', '!Test.control.js', '!CMD*.js'],
                    dest: './tmp/target/' + opts.packageJson.lep.releaseDirectoryName,
                    expand: true
                },
                {
                    cwd: '.',
                    src: ['doc/**', '!doc/**/wikiOnly/**'],
                    dest: './tmp/target/' + opts.packageJson.lep.releaseDirectoryName,
                    expand: true
                }
            ]
        },
        historyToTarget: {
            files: [{
                src: ['./stable-version-for-download/history.txt'],
                dest: './tmp/target/' + opts.packageJson.lep.releaseDirectoryName,
                expand: true,
                flatten: true
            }]
        },
        toBitwigForLiveTest: {
            files: [
                {
                    cwd: './src',
                    src: ['**/*.js'],
                    dest: opts.RELEASE_PATH_IN_BITWIG,
                    expand: true
                }
            ]
        },
        'apiSourcesFromBitwig': {
            files: [
                {
                    src: opts.BITWIG_API_SOURCE_PATHS,
                    dest: opts.packageJson.lep.bitwigApiStubsPath,
                    flatten: true,
                    expand: true
                }
            ]
        }
    };
};