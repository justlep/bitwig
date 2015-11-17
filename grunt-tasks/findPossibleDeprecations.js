/**
 * Parses the API documentation deprecations list and searches for possible usages
 * within the controller scripts.
 */
module.exports = function (grunt, opts) {
    'use strict';

    var fs = require('fs');

    // /resources/doc/control-surface/api/deprecated.html

    grunt.registerTask('findPossibleDeprecations', 'Finds usages of deprecated methods in the controller scripts.',
        function() {
            var jsSources = grunt.file.expand(['src/**/*.js', '!src/lib/**']);

            // TODO scan deprecated.html from Bitwig folder for depreated methods;

            grunt.log.writeln('TODO...');

            jsSources.forEach(function(filename) {
                var js = grunt.file.read(filename);

                // TODO find usages
            });
        });
};