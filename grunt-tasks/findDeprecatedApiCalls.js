/**
 * Parses the API documentation deprecations list and searches for possible usages
 * within the controller scripts.
 */
module.exports = function (grunt) {
    'use strict';

    /**
     * Returns the path of the Bitwig API documentation HTML file for deprecations.
     * @returns {String} {Bitwig-installation-dir}/resources/doc/control-surface/api/deprecated.html
     */
    function getDeprecationsHtmlFileLocation() {
        var path = require('path'),
            bitwigInstallDir = process.env['ProgramFiles(x86)'] + '/Bitwig Studio',
            fileLocation = bitwigInstallDir + '/resources/doc/control-surface/api/deprecated.html';

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

        grunt.log.writeln('Scraping Bitwig HTML documentation...');
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

        grunt.log.writeln('Bitwig ' + deprecations.bitwigVersion + ' is documenting ' + deprecations.fullNames.length + ' deprecated methods');

        return deprecations;
    }


    grunt.registerTask('findDeprecatedApiCalls', 'Finds usages of deprecated methods in the controller scripts.', function() {
        var fs = require('fs'),
            jsSources = grunt.file.expand(['src/**/*.js', '!src/lib/**']),
            deprecations = parseDeprecationHtml(),
            /**
             * @type (String) If this marker is found in a suspect line or in the line above it,
             *                no deprecation warning will be output
             */
            IGNORE_MARKER = '@deprecationChecked:' + deprecations.bitwigVersion,
            MARKED_BLANK_LINE_REGEX = new RegExp('^[\\t\\s]*\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            MARKED_CODE_LINE_REGEX = new RegExp('\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            suspectLinesCount = 0;


        grunt.log.writeln('Scanning for usages...');

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
                        grunt.log.writeln('\n------\n**** ' + filename + ' ****');
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
                'Found suspect lines of code in ' + suspectLinesCount + ' file(s).',
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
            grunt.log.ok('\nNo usages found.');
        }
    });

};