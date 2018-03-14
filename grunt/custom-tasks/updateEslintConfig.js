/**
 * Updates the controller scripts' eslint config with all global functions + classes from the Bitwig API stubs.
 *
 * The task is scanning all the .js files in /bitwigApiStubs for global function declarations,
 * putting their names into the globals section of src/.eslintrc.
 */
module.exports = function (grunt, opts) {

    const TASK_NAME = 'updateEslintConfig',
          TARGET_ESLINTRC = 'src/.eslintrc',
          TARGET_SUMMARY_FILE = 'bitwigApiStubs/!all-globals-list.txt';

    grunt.registerTask(TASK_NAME, 'Updates the controller scripts .eslintrc with latest Bitwig globals', () => {

        let FN_OR_CLASS_REGEX = /function[\s\t]+([a-z0-9_]+)\(/ig,
            API_VERSION_REGEX = /\/\* API Version - (\d\.\d+[.0-9A-Za-z-]*) \*\//,
            eslintrcJson = grunt.file.readJSON(TARGET_ESLINTRC),
            apiStubFiles = grunt.file.expand(['bitwigApiStubs/**/*.js']),
            globalClasses = [],
            globalFunctions = [],
            foundApiVersion = null,
            newGlobals = {
                'lep': true,
                'init': true,
                'exit': true,
                'flush': true,
                'ko': false,
                'host': false,
                'load': false,
                'loadAPI': false
            };

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
            newGlobals[name] = false;
        });

        eslintrcJson.globals = newGlobals;

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
        grunt.file.write(TARGET_ESLINTRC, JSON.stringify(eslintrcJson, null, 2));
        grunt.log.ok('\nWritten ' + TARGET_ESLINTRC);
        grunt.file.write(TARGET_SUMMARY_FILE, summaryParts.join('\n'));
        grunt.log.ok('\nWritten ' + TARGET_SUMMARY_FILE);
    });
};