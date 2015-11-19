/**
 * Parses the API documentation deprecations list and searches for possible usages
 * within the controller scripts.
 */
module.exports = function (grunt) {
    'use strict';

    /**
     * @returns {String} the HTML content of {Bitwig-installation-dir}/resources/doc/control-surface/api/deprecated.html
     */
    function getBitwigDeprecationsHtml() {
        var bitwigInstallDir = process.env['ProgramFiles(x86)'] + '/Bitwig Studio',
            deprecationsHtmlFile = bitwigInstallDir + '/resources/doc/control-surface/api/deprecated.html',
            html;

        try {
            html = grunt.file.read(deprecationsHtmlFile);
        } catch (e) {
            throw 'Unable to determine Bitwig\'s installation deprecation HTML file.';
        }

        return html;
    }

    /**
     * Parses the deprecation html from the Bitwig API documentation.
     * @return {Object} containing an object with two lists
     *          - fullNames (String[]) fully-qualified method names (e.g. "ClassX.methodY")
     *          - shortNames (String[]) only method names (e.g. "methodY")
     *          - signatures (String[]) e.g. "(String, String)"
     */
    function parseDeprecationHtml() {
        var html = getBitwigDeprecationsHtml(),
            firstIndex = html.indexOf('<dl'),
            lastIndex = html.lastIndexOf('</dl>'),
            length = lastIndex - firstIndex + 5,
            REGEX = /<a.+[a-z0-9]{20}">(.+\..+)<\/a>([^<]*)/ig,
            lists = {
                fullNames: [],
                shortNames: [],
                signatures: []
            };

        if (length < 9) {
            throw 'Deprecation HTML has unexpected format';
        }

        grunt.log.writeln('Scraping deprecations from Bitwig HTML documentation...');
        html.substr(firstIndex, length).replace(REGEX, function(found, fullName, sig, idx, foo) {
            var shortName = fullName.replace(/^[^\.]*\./, ''),
                signature = sig.replace(/^\s*/,'');
            lists.fullNames.push(fullName);
            lists.shortNames.push(shortName);
            lists.signatures.push(signature);
            grunt.log.writeln('Parsed: ' + fullName + signature);
        });

        return lists;
    }


    grunt.registerTask('findPossibleDeprecations', 'Finds usages of deprecated methods in the controller scripts.', function() {
        var fs = require('fs'),
            jsSources = grunt.file.expand(['src/**/*.js', '!src/lib/**']),
            deprecationLists = parseDeprecationHtml();

        grunt.log.writeln('\nScanning for usages of deprecated methods...');

        jsSources.forEach(function(filename) {
            var jsLines = grunt.file.read(filename).split('\n'),
                matchFound = false;

            jsLines.forEach(function(jsLine, lineIndex) {
                var jsLineLowercase = jsLine.toLowerCase();
                deprecationLists.shortNames.forEach(function(shortName, i) {
                    if (jsLineLowercase.indexOf('.'+shortName.toLowerCase()+'(') < 0) return;
                    if (!matchFound) {
                        grunt.log.writeln('\n------\n**** ' + filename + ' ****');
                        matchFound = true;
                    }
                    grunt.log.warn('Line ' + (lineIndex+1) + ': ' + jsLine.replace(/^\s*/,''));
                    grunt.log.writeln('Deprecated: ' + deprecationLists.fullNames[i] + deprecationLists.signatures[i] + '\n');
                });
            });
        });
    });

};