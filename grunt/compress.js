module.exports = function (grunt, opts) {
    'use strict';

    var pkg = opts.packageJson,
        zipComment = [
            pkg.title,
            'Version ' + pkg.version,
            pkg.repository.url,
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
        }
    };
};