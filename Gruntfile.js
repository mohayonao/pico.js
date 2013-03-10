"use strict";

module.exports = function(grunt) {
    
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    
    grunt.initConfig({
        jshint: {
            all: ["pico.*.js"],
            options: {
                curly   : true,
                eqeqeq  : true,
                latedef : true,
                noarg   : true,
                noempty : true,
                quotmark: "double",
                undef   : true,
                strict  : true,
                trailing: true,
                newcap  : false,
                browser : true,
                node    : true
            }
        },
        uglify: {
            all: {
                options: { sourceMap: "pico.js.map" },
                files: { "pico.js": ["pico.dev.js"] }
            }
        },
        watch: {
            src: {
                files: ["pico.*.js"],
                tasks: ["default"]
            }
        },
        clean: ["pico.js", "pico.js.map"]
    });
    
    grunt.registerTask("default", ["jshint", "uglify"]);
};
