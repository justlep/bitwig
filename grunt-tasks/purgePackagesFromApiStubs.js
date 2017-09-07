/**
 * Removes the Java package part from the JSDoc comments of the local API stub js-files.
 */
module.exports = function (grunt, opts) {
    'use strict';

    grunt.registerTask('purgePackagesFromApiStubs', 'Removes Java package part from ApiStubs JSDoc comments.', function() {
        var JAVA_PACKAGE_PART_REGEX = /com\.bitwig\.extension[a-zA-Z0-9\.]+\.([A-Z][a-zA-Z0-9]+)/g,
            apiSources = grunt.file.expand(['bitwigApiStubs/**/*.js']),
            totalOccurrences = 0;

        // grunt.log.writeln(apiSources);
        grunt.log.writeln('Cleaning Java package info from ApiStubs...');

        apiSources.forEach(function(filename) {
            var fileContent = grunt.file.read(filename),
                fixedContent = fileContent.replace(JAVA_PACKAGE_PART_REGEX, function(fullyQualifiedClass, classNameOnly, idx, foo) {
                    totalOccurrences++;
                    // grunt.log.writeln(`Replacing: ${fullyQualifiedClass} --> ${classNameOnly}`);
                    return classNameOnly;
                });

            grunt.file.write(filename, fixedContent);
        });

        grunt.log.ok(`\nSimplified ${totalOccurrences} class names in ${apiSources.length} API stub files.`);
    });

};

