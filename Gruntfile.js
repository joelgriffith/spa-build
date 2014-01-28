/**
 * Gruntfile.js
 */
module.exports = function(grunt) {

    'use strict';

    // Path abstractions
    var baseDir = 'app',
        devDir = 'build/dev',
        distDir = 'build/dist',
        scss = baseDir + '/scss/*.scss',
        js = baseDir + '/js/*.js',
        jsIndex = baseDir + '/js/index.js',
        scssIndex = baseDir + '/scss/index.scss';

    // Load dev dependencies
    require('load-grunt-tasks')(grunt);
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
                    base: [ baseDir ]
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

        // RequireJS
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: jsIndex,
                    include: 'index',
                    optimize: 'none',
                    out: devDir + '/js/index.js'
                }
            }
        },

        // UglifyJS
        uglify: {
            dist: {
                files: {
                    'build/dist/js/index.js': [ distDir + '/js/index.js' ]
                }
            }
        },

        // Sass compiling
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'build/dist/css/index.css': scssIndex
                }
            },
            dev: {
                options: {
                    style: 'nested',
                    sourcemap: true,
                    compass: true
                },
                files: {
                    'build/dev/css/index.css': scssIndex
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
                    'build/dist/index.html': [ baseDir + '/template.html' ]
                }
            },
            dev: {
                files: {
                    'build/dev/index.html': [ baseDir + '/template.html' ]
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
                    baseDir + '/css/**/*.css',
                    '**/*.html'
                ]
            }
        }
    });
    
    // Command line tasks
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['jshint', 'jsonlint', 'requirejs', 'processhtml', 'uglify', 'sass']);
    grunt.registerTask('serve', ['build', 'connect:livereload', 'watch']);
};