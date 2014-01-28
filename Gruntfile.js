/**
 * Gruntfile.js
 */
module.exports = function(grunt) {

    'use strict';

    // Configure the app path
    var base = 'app',
        js = base + '/js/*.js',
        jsIndex = base + '/js/index.js',
        scss = base + '/scss/index.scss';

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
                    'build/dist/css/index.css': scss
                }
            },
            dev: {
                files: {
                    'build/dev/css/index.css': scss
                }
            }
        },

        // RequireJS
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: jsIndex,
                    include: 'index',
                    optimize: 'none',
                    out: 'build/dev/js/index.js'
                }
            }
        },

        // UglifyJS
        uglify: {
            dist: {
                files: {
                    'build/dist/js/index.js': ['build/dev/js/index.js']
                }
            }
        },

        // CSS Minification
        cssmin: {
            dist: {
                files: {
                    'build/dist/css/index.css': ['build/dist/css/index.css']
                }
            }
        },

        // Process HTML
        processhtml: {
            options: {
                data: {
                    name: '<%= pkg.name %>'
                }
            },
            dist: {
                files: {
                    'build/dist/index.html': [ base + '/template.html' ]
                }
            },
            dev: {
                files: {
                    'build/dev/index.html': [ base + '/template.html' ]
                }
            }
        },

        // Watch Settings
        watch: {
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
    grunt.registerTask('build', ['jshint', 'jsonlint', 'requirejs', 'processhtml', 'uglify', 'sass', 'cssmin']);
    grunt.registerTask('serve', ['build', 'connect:livereload', 'watch']);
};