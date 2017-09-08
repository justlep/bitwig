/**
 * Removes the Java package part from the JSDoc comments of the local API stub js-files.
 */
module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('purgePackagesFromApiStubs', 'Removes Java package part from ApiStubs JSDoc comments.', function() {
        let JAVA_PACKAGE_PART_REGEX = /com\.bitwig\.extension[a-zA-Z0-9\.]+\.([A-Z][a-zA-Z0-9]+)/g,
            apiSources = grunt.file.expand(['bitwigApiStubs/**/*.js']),
            totalOccurrences = 0;

        grunt.log.writeln('Purging Java package names from API stubs...');

        apiSources.forEach(function(filename) {
            let fileContent = grunt.file.read(filename),
                fixedContent = fileContent.replace(JAVA_PACKAGE_PART_REGEX, function(fullyQualifiedClass, classNameOnly, idx, foo) {
                    totalOccurrences++;
                    // grunt.log.writeln(`Replacing: ${fullyQualifiedClass} --> ${classNameOnly}`);
                    return classNameOnly;
                });

            grunt.file.write(filename, fixedContent);
        });

        grunt.log.ok(`Simplified ${totalOccurrences} class names in ${apiSources.length} API stub files.`);
    });

};

