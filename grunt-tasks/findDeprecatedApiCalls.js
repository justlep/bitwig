
/**
 * The values for the `referenceApi` property in the grunt config file for this task.
 */
const REFERENCE_API = {
          LATEST_IN_REPO: 'latestInRepo',
          LOCAL_BITWIG_INSTALLATION: 'localBitwigInstallation'
      };

/**
 * Parses the API documentation deprecations list and searches for possible usages
 * within the controller scripts.
 */
module.exports = function(grunt) {
    'use strict';

    /**
     * Returns the path of the Bitwig API documentation HTML file for deprecations.
     * @returns {String} {Bitwig-installation-dir}/resources/doc/control-surface/api/deprecated.html
     */
    function getDeprecationsHtmlFileLocation() {
        var path = require('path'),
            programFilesDir = process.env['ProgramFiles(x86)'],
            // TODO FIXME
            //bitwigInstallDir = (programFilesDir) ? (programFilesDir + '/Bitwig Studio') : '{Bitwig installation dir}',
            bitwigInstallDir = 'C:/Program Files/Bitwig Studio 2/',
            fileLocation = bitwigInstallDir + '/resources/doc/control-surface/api/a00307.html';

        return path.normalize(fileLocation);
    }

    /**
     * @returns {String} the HTML content of the deprecations HTML file
     */
    function getBitwigDeprecationsHtml() {
        var htmlFileLocation = getDeprecationsHtmlFileLocation(),
            html = '';

        try {
            html = grunt.file.read(htmlFileLocation);
        } catch (e) {
            grunt.fail.warn('Unable to read ' + htmlFileLocation);
        }

        return html;
    }

    /**
     * Parses the deprecation html from the Bitwig API documentation.
     * @return {Object} with these properties:
     *                   - bitwigVersion (String) the Bitwig version of the parsed deprecations file
     *                   - shortNames (String[]) only method names without class and signature (e.g. "methodY")
     *                   - fullNames (String[]) full method names incl. signature (e.g. "ClassX.methodY(String s)")
     */
    function parseDeprecationHtml() {
        var html = getBitwigDeprecationsHtml(),
            versionIndex = html.indexOf('<span id="projectnumber">'),
            bitwigVersion = versionIndex && html.substr(versionIndex, 40).match(/>([^<]*)<\//)[1],
            firstIndex = html.indexOf('<dl'),
            lastIndex = html.lastIndexOf('</dl>'),
            length = lastIndex - firstIndex + 5,
            REGEX = /<a.+[a-z0-9]{20}">(.+\..+)<\/a>([^<]*)/ig,
            deprecations = {
                bitwigVersion: bitwigVersion,
                shortNames: [],
                fullNames: []
            };

        if (!bitwigVersion) {
            grunt.fail.warn('Could not find Bitwig version in depreations HTML');
        } else if (length < 9) {
            grunt.fail.warn('Could not find deprecations list in depreations HTML');
        }

        grunt.log.writeln('Scraping installed Bitwig HTML documentation...');
        html.substr(firstIndex, length).replace(REGEX, function(found, fullNameWithoutSig, sig, idx, foo) {
            var shortName = fullNameWithoutSig.replace(/^[^\.]*\./, ''),
                fullName = fullNameWithoutSig + sig.replace(/^\s*/,'');
            deprecations.fullNames.push(fullName);
            deprecations.shortNames.push(shortName);
            // grunt.log.writeln('Scraped: ' + fullName);
        });

        if (!deprecations.fullNames.length) {
            grunt.fail.warn('Found no methods in the HTML documentation. Please check findDeprecatedApiCalls.js.');
        }

        grunt.log.writeln('Found Bitwig ' + deprecations.bitwigVersion +
                          ', documenting ' + deprecations.fullNames.length + ' deprecated methods');

        return deprecations;
    }

    function getJsonFilename(bitwigVersion) {
        return './grunt-tasks/.deprecations-'+ bitwigVersion +'.json';
    }

    function laxVersion(version) {
        const RE = /^(\d+)\.(\d+)(?:\.(\d+))?/;
        return {
            split: RE.test(version||'') ? [parseInt(RegExp.$1,10), parseInt(RegExp.$2,10), parseInt(RegExp.$3||'0',10)] : [0,0,0],
            spread: function() {
                return (this.split[0] << 32) + (this.split[1] << 16) + this.split[2];
            },
            isBiggerThan: function(v2) {
                return this.spread() > laxVersion(v2).spread();
            },
            isSmallerThan: function(v2) {
                return this.spread() < laxVersion(v2).spread();
            }
        };
    }

    function getLatestSavedDeprecationsFileVersion() {
        var highestVersion = null;
        grunt.file.expand([getJsonFilename('*')]).forEach(function(filename) {
            var version = filename.match(/\d+\.\d+(?:\.\d+)?/)[0];
            if (laxVersion(version).isBiggerThan(highestVersion)) {
                highestVersion = version;
            }
        });
        if (!highestVersion) {
            grunt.fail.warn('No saved deprecation files found. Try running `grunt findDeprecatedApiCalls:installed` instead.');
        }
        return highestVersion;
    }

    /**
     * Loads json with API deprecation info either from a local json already generated OR
     * from the Bitwig version installed on the machine.
     * @param referenceApi (String) version|"latest"|"installed"
     * @returns (Object)
     */
    function getDeprecationJson(referenceApi) {
        var deprecationJson,
            filename,
            bitwigVersion;

        switch (referenceApi) {
            case REFERENCE_API.LATEST_IN_REPO:
                bitwigVersion = getLatestSavedDeprecationsFileVersion();
                break;

            case REFERENCE_API.LOCAL_BITWIG_INSTALLATION:
                // load deprecations of installed Bitwig version and write json file with deprecation info afterwards
                deprecationJson = parseDeprecationHtml();
                filename = getJsonFilename(deprecationJson.bitwigVersion);
                try {
                    grunt.file.write(filename, JSON.stringify(deprecationJson, null, 2));
                    grunt.log.ok('Generated ' + filename + ' --> !!! Remember to git-commit it !!!');
                    bitwigVersion = deprecationJson.bitwigVersion;
                } catch (e) {
                    grunt.fail.warn('Could not write ' + filename, e);
                }
                break;

            default:
                grunt.fail.fatal('Invalid referenceApi parameters: ' + referenceApi, 1);
        }

        if (!bitwigVersion) {
            grunt.fail.warn('Unable to determine bitwigVersion to find decrecations for.');
        }

        // load deprecations from existing file
        filename = getJsonFilename(bitwigVersion);
        try {
            deprecationJson = grunt.file.readJSON(filename);
        } catch (e) {
            grunt.fail.warn('No deprecation file found for Bitwig ' + bitwigVersion + '.\n' +
                            'Try running `grunt findDeprecatedApiCalls:installed` to generate one.');
        }
        grunt.log.writeln('Using deprecation info file ' + filename + ' --> Bitwig ' + bitwigVersion);
        return deprecationJson;
    }

    grunt.registerMultiTask('findDeprecatedApiCalls', 'Finds usages of deprecated methods in the controller scripts.', function() {
        var jsSources = grunt.file.expand(this.options().files),
            deprecations = getDeprecationJson(this.data.referenceApi),
            /**
             * @type (String) If this marker is found in a suspicious line or in the line above it,
             *                no deprecation warning will be output
             */
            IGNORE_MARKER = '@deprecationChecked:' + deprecations.bitwigVersion,
            MARKED_BLANK_LINE_REGEX = new RegExp('^[\\t\\s]*\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            MARKED_CODE_LINE_REGEX = new RegExp('\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            suspectLinesCount = 0;

        grunt.log.writeln('Scanning '+ jsSources.length +' files for deprecated API calls...');

        jsSources.forEach(function(filename) {
            var jsLines = grunt.file.read(filename).split('\n'),
                matchFound = false,
                previousLineContainedIgnoreMarker = false;

            jsLines.forEach(function(jsLine, lineIndex) {
                if (MARKED_BLANK_LINE_REGEX.test(jsLine)) {
                    previousLineContainedIgnoreMarker = true;
                    return;
                }
                if (previousLineContainedIgnoreMarker || MARKED_CODE_LINE_REGEX.test(jsLine)) {
                    previousLineContainedIgnoreMarker = false;
                    return;
                }
                deprecations.shortNames.forEach(function(shortName, i) {
                    if (jsLine.indexOf('.' + shortName + '(') < 0) {
                        return;
                    }
                    if (!matchFound) {
                        grunt.log.writeln('\n------');
                        grunt.log.writeln( ('Possible deprecation | ' + filename).yellow );
                        matchFound = true;
                        suspectLinesCount++;
                    }
                    grunt.log.warn('Line ' + (lineIndex+1) + ': ' + jsLine.replace(/^\s*/,''));
                    grunt.log.writeln('Deprecated: ' + deprecations.fullNames[i] + '\n');
                });
            });
        });
        if (suspectLinesCount) {
            grunt.fail.warn(['\n',
                '***********************************************************************************',
                'Suspicious code in ' + suspectLinesCount + ' file(s).',
                'Replace deprecated code or mark it non-deprecated by adding following JS comment:',
                '   /* '+ IGNORE_MARKER + '*/    or',
                '   // ' + IGNORE_MARKER,
                '',
                'See Bitwig API documentation:',
                getDeprecationsHtmlFileLocation(),
                '***********************************************************************************',
                '\n'
            ].join('\n'));

        } else {
            grunt.log.ok('All looking good.');
        }
    });

};

module.exports.REFERENCE_API = REFERENCE_API;
