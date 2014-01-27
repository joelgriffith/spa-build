/**
 * Gruntfile.js
 */
module.exports = function(grunt) {

    // Load dev dependencies
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take for build time optimizations
    require('time-grunt')(grunt);

    // Configure the app path
    var base = 'app';
    grunt.initConfig({

        // Parameters
        pkg: grunt.file.readJSON('package.json'),
        bowercopy: grunt.file.readJSON('bowercopy.json'),
        
        // Connect
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [ base ]
                }
            }
        },

        // JSHint Settings
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [ base + '/js/*.js' ]
        },

        // JSONLint Settings
        jsonlint: {
            pkg: {
                src: 'package.json'
            },
            bower: {
                src: '{bower,bowercopy}.json'
            }
        },

        // Sass Compiling
        sass: {
            dist: {
                files: {
                    'app/build/css/index.css': 'app/scss/index.scss'
                }
            }
        },

        // Watch Settings
        watch: {
            // Live reload
            reload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= jshint.all %>',
                    '<%= jsonlint.pkg.src %>',
                    '<%= jsonlint.bower.src %>',
                    base + '/css/**/*.css',
                    '**/*.html'
                ]
            }
        }
    });
    
    // Command line tasks
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['bowercopy', 'jshint', 'jsonlint', 'sass']);
    grunt.registerTask('serve', ['build', 'connect:livereload', 'watch']);
};