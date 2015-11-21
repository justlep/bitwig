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
            throw 'Unable to read ' + htmlFileLocation;
        }

        return html;
    }

    /**
     * Parses the deprecation html from the Bitwig API documentation.
     * @return {Object} containing an object with following properties:
     *          - bitwigVersion (String) the Bitwig version of the deprecations file
     *          - deprecationHtmlFileLocation (String) location of the HTML file in the filesystem
     *          - fullNames (String[]) fully-qualified method names (e.g. "ClassX.methodY")
     *          - shortNames (String[]) only method names (e.g. "methodY")
     *          - signatures (String[]) e.g. "(String, String)"
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
                fullNames: [],
                shortNames: [],
                signatures: []
            };

        if (!bitwigVersion) {
            throw 'Cound not find Bitwig version in depreations HTML';
        } else if (length < 9) {
            throw 'Could not find deprecations list in depreations HTML';
        }

        grunt.log.write('Scraping Bitwig HTML documentation...');
        html.substr(firstIndex, length).replace(REGEX, function(found, fullName, sig, idx, foo) {
            var shortName = fullName.replace(/^[^\.]*\./, ''),
                signature = sig.replace(/^\s*/,'');
            deprecations.fullNames.push(fullName);
            deprecations.shortNames.push(shortName);
            deprecations.signatures.push(signature);
            // grunt.log.writeln('Parsed: ' + fullName + signature);
        });

        grunt.log.writeln(' (' + deprecations.fullNames.length + ' deprecated methods, Bitwig v' + deprecations.bitwigVersion + ')');

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
            LINE_WITH_IGNORE_MARKER_ONLY_REGEX = new RegExp('^[\\t\\s]*\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            LINE_WITH_IGNORE_MARKER_AFTER_CODE_REGEX = new RegExp('\/[*\/][\\s\\t]*' + IGNORE_MARKER + '([^\\d]|$)'),
            suspectLinesCount = 0;


        grunt.log.writeln('Scanning for usages of deprecated methods...');

        jsSources.forEach(function(filename) {
            var jsLines = grunt.file.read(filename).split('\n'),
                matchFound = false,
                previousLineContainedIgnoreMarker = false;

            jsLines.forEach(function(jsLine, lineIndex) {
                if (LINE_WITH_IGNORE_MARKER_ONLY_REGEX.test(jsLine)) {
                    previousLineContainedIgnoreMarker = true;
                    return;
                }
                if (previousLineContainedIgnoreMarker || LINE_WITH_IGNORE_MARKER_AFTER_CODE_REGEX.test(jsLine)) {
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
                    grunt.log.writeln('Deprecated: ' + deprecations.fullNames[i] + deprecations.signatures[i] + '\n');
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