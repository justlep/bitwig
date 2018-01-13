/**
 * Generates a new .jshintrc file containing all global functions + classes of the Bitwig API as readonly in the globals section,
 * so jshint won't reject them as unknown.
 *
 * The task is scanning all the .js files in the /bitwigApiStubs folder for global function declarations.
 * Then loads /.jshintrc.in and adds the found function names into the JSON's 'globals' property,
 * afterwards saves the altered JSON into .jshintrc which is used by the jshint grunt task.
 */
module.exports = function (grunt, opts) {
    'use strict';

    const TASK_NAME = 'generateJshintConfig',
          TARGET_JSHINTRC = './.jshintrc',
          TARGET_SUMMARY_FILE = './bitwigApiStubs/!all-globals-list.txt';

    grunt.registerTask(TASK_NAME, 'Copies an altered .jshintrc to the api path.', () => {

        let FN_OR_CLASS_REGEX = /function[\s\t]+([a-z0-9_]+)\(/ig,
            API_VERSION_REGEX = /\/\* API Version - (\d\.\d+[.0-9A-Za-z-]*) \*\//,
            jshintrc = grunt.file.readJSON('.jshintrc.in'),
            apiStubFiles = grunt.file.expand(['bitwigApiStubs/**/*.js']),
            globalClasses = [],
            globalFunctions = [],
            foundApiVersion = null;

        // grunt.log.writeln(apiSources);
        grunt.log.writeln('Scanning API stub files for global classes and functions...');

        apiStubFiles.forEach(filename => {
            let js = grunt.file.read(filename);

            if (!foundApiVersion && API_VERSION_REGEX.test(js)) {
                foundApiVersion = RegExp.$1;
            }

            js.replace(FN_OR_CLASS_REGEX, (match, fnOrClassName /*, idx */) => {
                let firstLetter = fnOrClassName[0],
                    isClass = firstLetter.toUpperCase() === firstLetter,
                    targetList = isClass ? globalClasses : globalFunctions;

                targetList.push(fnOrClassName);
            });
        });

        globalClasses.sort().concat(globalFunctions.sort()).forEach(name => {
            jshintrc.globals[name] = false;
        });

        let numbersSummary = `API version ${foundApiVersion || '???'} | ${apiStubFiles.length} files | `+
                             `${globalClasses.length} classes | ${globalFunctions.length} global functions`,
            separator = '*'.repeat(numbersSummary.length),
            summaryParts = ['',
                separator,
                `Last result of \`grunt ${TASK_NAME}\``,
                numbersSummary,
                separator,
                `\nGlobal functions: \n - ${globalFunctions.join('\n - ')}\n`,
                `Global classes: \n - ${globalClasses.join('\n - ')}`
            ];

        grunt.log.ok(numbersSummary);
        grunt.file.write(TARGET_JSHINTRC, JSON.stringify(jshintrc, null, 2));
        grunt.log.ok('\nWritten ' + TARGET_JSHINTRC);
        grunt.file.write(TARGET_SUMMARY_FILE, summaryParts.join('\n'));
        grunt.log.ok('\nWritten ' + TARGET_SUMMARY_FILE);
    });
};