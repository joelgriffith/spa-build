/**
 * Gruntfile.js
 */
module.exports = function(grunt) {

    // Configure the app path
    var base = 'app'
        , js = base + '/js/*.js'
        , jsindex = base + '/js/index.js'
        , scss = base + '/scss/index.scss';

    // Load dev dependencies
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take for build time optimizations
    require('time-grunt')(grunt);
    grunt.initConfig({

        // Parameters
        pkg: grunt.file.readJSON('package.json'),
        
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
            all: [ js ]
        },

        // JSONLint Settings
        jsonlint: {
            pkg: {
                src: 'package.json'
            },
            bower: {
                src: 'bower.json'
            }
        },

        // Sass Compiling
        sass: {
            dist: {
                files: {
                    'app/dist/css/index.css': scss
                }
            },
            dev: {
                files: {
                    'app/dev/css/index.css': scss
                }
            }
        },

        // RequireJS
        requirejs: {
            compile: {
                options: {
                    baseUrl: app,
                    mainConfigFile: jsIndex,
                    name: pkg.name,
                    out: 'app/dev/js/index.js'
                }
            }
        },

        // Uglify
        uglify: {
            my_target: {
                files: {
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
    grunt.registerTask('build', ['jshint', 'jsonlint', 'sass', 'requirejs', 'uglify']);
    grunt.registerTask('serve', ['build', 'connect:livereload', 'watch']);
};