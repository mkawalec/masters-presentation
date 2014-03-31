var fs = require('fs');

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concurrent: {
            dev: {
                tasks: ['watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        watch : {
            scripts : {
                files: ['src/*.js'],
                tasks: ['browserify']
            }
        },

        browserify : {
            dist : {
                files : {
                    'template/js/bundle.js' : ['src/*.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['browserify', 'concurrent']);
};
