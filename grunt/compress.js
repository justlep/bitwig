module.exports = function (grunt, opts) {

    const ZIP_COMMENT = [
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
                comment: ZIP_COMMENT
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
                archive: 'bitwigApiStubs/!unmodified-stubs.zip',
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