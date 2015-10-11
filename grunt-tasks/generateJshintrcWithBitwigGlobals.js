/**
 * Generates a new .jshintrc file containing all global functions of the Bitwig API and the control scripts
 * as 'predefined', so JSHINT won't report them as unknown.
 *
 * The task is scanning all the .js files in the src/ folder (especially the Bitwig-API-ones)
 * for global function declarations.
 * Then loads the JSON of /.jshintrc and adds the found function names into the 'predef' property,
 * afterward saves the new version of .jshintrc into the src/bitwig-api/ folder,
 * where it will be expected and used by the jshint grunt task.
 */
module.exports = function (grunt, opts) {
    'use strict';

    var fs = require('fs'),
        TARGET_JSHINTRC = './.jshintrc';

    grunt.registerTask('generateJshintrcWithBitwigGlobals', 'Copies an altered .jshintrc to the api path.',
        function() {
            var jshintrcJSON = grunt.file.readJSON('.jshintrc.in'),
                apiSources = grunt.file.expand(['bitwigApiStubs/**/*.js', 'src/**/*.js', '!src/**/*.control.js', '!src/lib/**']);

            // grunt.log.writeln(apiSources);
            grunt.log.writeln('Generating bitwig-API-compatible .jshintrc ...');

            apiSources.forEach(function(filename) {
                var js = grunt.file.read(filename);

                js.replace(/function[\s\t]+([a-z0-9_]+)\(/ig, function(found, fnName, idx, foo) {
                    grunt.log.writeln('Found global function "'+ fnName +'"');
                    jshintrcJSON.predef.push(fnName);
                });
            });

            grunt.file.write(TARGET_JSHINTRC, JSON.stringify(jshintrcJSON, null, 2));
            grunt.log.writeln('\nCopied bitwig-compatible .jshintrc to ' + TARGET_JSHINTRC);
        });
};