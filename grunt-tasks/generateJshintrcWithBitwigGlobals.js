/**
 * Generates a new .jshintrc file containing all global functions of the Bitwig API 'predefined',
 * so jshint won't report them as unknown.
 *
 * The task is scanning all the .js files in the /bitwigApiStubs folder for global function declarations.
 * Then loads /.jshintrc.in and adds the found function names into the JSON's 'predef' property,
 * afterwards saves the altered JSON into .jshintrc which is used by the jshint grunt task.
 */
module.exports = function (grunt, opts) {
    'use strict';

    var fs = require('fs'),
        TARGET_JSHINTRC = './.jshintrc';

    grunt.registerTask('generateJshintrcWithBitwigGlobals', 'Copies an altered .jshintrc to the api path.',
        function() {
            var jshintrcJSON = grunt.file.readJSON('.jshintrc.in'),
                apiSources = grunt.file.expand(['bitwigApiStubs/**/*.js']);

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