module.exports = function (grunt, opts) {

    return {
        options: {
            colors: true,
            reporter: 'spec',
            // captureFile: 'results.txt', // Optionally capture the reporter output to a file
            quiet: false,                  // Optionally suppress output to standard out (defaults to false)
            clearRequireCache: false       // Optionally clear the require cache before running tests (defaults to false)
        },
        all: {
            src: ['test/specs/*.spec.js']
        },
        StandardRangedValue: {
            src: ['test/specs/StandardRangedValue.spec.js']
        }
    };
};
