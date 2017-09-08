/**
 * Generates an "info.txt" in the target/{scriptdir} folder containing
 * the name, version and repository of the archive.
 */
module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('generateInfoTxtInTarget', 'Generates an info.txt file for the ZIP archive', () => {
        let packageJson = grunt.file.readJSON('package.json'),
            TARGET_TXT_PATH = 'tmp/target/' + packageJson.lep.releaseDirectoryName + '/info.txt',
            info = [
                packageJson.title,
                packageJson.description,
                'Version ' + packageJson.version,
                'Written by ' + packageJson.author.name + ' <'+ packageJson.author.email +'>',
                'URL: ' + packageJson.repository.url,
                'Licensed under MIT - http://www.opensource.org/licenses/mit-license.php',
                'Check the doc folder for documentation.'
            ];

        grunt.file.write(TARGET_TXT_PATH, info.join('\n\n'));

        grunt.log.ok('\nWritten ' + TARGET_TXT_PATH);
    });
};