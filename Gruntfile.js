module.exports = function (grunt) {
    'use strict';

    require('time-grunt')(grunt);

    var fs = require('fs'),
        packageJson = grunt.file.readJSON('package.json'),
        // provided as 'opts' parameter to the task files in grunt/*.js
        data = {};

    try {
        // the Bitwig installation's dir (Windows)
        data.BITWIG_INSTALL_DIR = fs.realpathSync(process.env['ProgramFiles(x86)'] + '/Bitwig Studio');
    } catch (e) {
        throw 'Unable to determine Bitwig\'s installation directory. Please fix Gruntfile.js.';
    }
    try {
        // The directory where Bitwig stores Controller scripts (in the user's home directory) (Windows)
        data.BITWIG_CS_BASE_PATH = fs.realpathSync(process.env.USERPROFILE + '/Documents/Bitwig Studio/Controller Scripts');
    } catch (e) {
        throw 'Unable to determine Bitwig\'s controller script directory. Please fix Gruntfile.js.';
    }

    data.BITWIG_API_SOURCE_PATHS = [
        data.BITWIG_INSTALL_DIR + '/resources/doc/control-surface/js-stubs/**/*.js',
        data.BITWIG_INSTALL_DIR + '/resources/controllers/api/**/*.js'
    ];

    data.RELEASE_PATH_IN_BITWIG = data.BITWIG_CS_BASE_PATH + '/' + packageJson.lep.releaseDirectoryName;
    data.VERSIONED_RELEASE_ZIP_PATH = packageJson.lep.releaseZipFilenamePattern.replace('{version}', packageJson.version);

    require('load-grunt-config')(grunt, {
        init: true,
        data: data
    });

    grunt.loadTasks('grunt-tasks');
};
