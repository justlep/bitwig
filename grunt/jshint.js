module.exports = function (grunt, opts) {

    return {
        options: {
            jshintrc: '.jshintrc',
            verbose: true
        },
        all: [
            'Gruntfile.js',
            'grunt/*.js',
            'grunt-tasks/*.js',
            'src/**/*.js',
            '!src/lib/**'
        ]
    };
};