module.exports = function (grunt, opts) {
    'use strict';
    return {
        options: {
            files: ['src/**/*.js', '!src/lib/**']
        },
        latest: {
            bitwigVersion: 'latest'
        },
        installed: {
            bitwigVersion: 'installed'
        }
    };
};