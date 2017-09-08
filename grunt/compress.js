module.exports = function (grunt, opts) {
    'use strict';

    var zipComment = [
            '<%= package.title %>',
            'Version <%= package.version %>',
            '<%= package.repository.url %>',
            'History:',
            grunt.file.read('stable-version-for-download/history.txt')
        ].join('\n\n');

    return {
        zipTargetToRelease: {
            options: {
                mode: 'zip',
                level: 1,
                pretty: true,
                archive: opts.VERSIONED_RELEASE_ZIP_PATH,
                comment: zipComment
            },
            files: [
                {
                    expand: true,
                    cwd: './tmp/target/',
                    src: ['**/*.*', '!.git', '!.svn']
                }
            ]
        },
        unmodifiedApiStubs: {
            options: {
                mode: 'zip',
                level: 1,
                pretty: true,
                archive: 'bitwigApiStubs/!unmodifiedApiStubs.zip',
                comment: 'Original API stubs from the Bitwig installation'
            },
            files: [
                {
                    expand: true,
                    cwd: 'bitwigApiStubs/',
                    src: ['*.js']
                }
            ]
        }
    };
};