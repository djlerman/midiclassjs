/*
 * Wrapper function, since grunt uses node modules for its behavior
 */

module.exports = function(grunt) {

  /*
   * The configuration object holds config for each task.
   * The property names must match the task names.
   */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /*
     * build the MIDITools project
     */
    browserify: {
      js: {
        src: 'js/index.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    groc: {
      js: {
        src: [
	  'js/*.js', 'js/*/*.js', 'README.md'
        ],
        options: {
	  'out': 'docs/'
        }
      }
    },

    markdown: {
      all: {
        files: [{ 
          expand: true,
          src: 'docs/ref/*.md',
          dest: '.',
          ext: '.html'
        }]
      }
    },

    jasmine_node: {
      options: {
        forceExit: false,
        match: '.',
        matchall: false,
        verbose: false,
        extensions: 'js',
        specNameMatcher: 'spec'
      },
      all: ['spec/']
    },

    // TODO: fix etc/jshintrc to reset max-lines to 15 after index.js is shrunk
    // TODO: merge options into the jshintrc file
    jshint: {
      files: ['js/**/*.js', 'spec/*.js'],
      options: {
        // options here to override JSHint defaults
        browserify: true,
        browser: true,
        jshintrc: 'etc/jshintrc'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'browserify', 'jasmine_node', 'groc'
//        ,'markdown'
      ]
    }
  });

  var taskConfig = {
    tasks: [
      'grunt-contrib-jshint',
      'grunt-contrib-watch',
      'grunt-browserify',
      'grunt-groc',
      "grunt-jasmine-node",
      'grunt-markdown'
    ],
    register: [{
      name: 'test',
      tasks: ['jshint']
    }, {
      name: 'default',
      tasks: ['jshint', 'browserify']
    }]
  };

  taskConfig.tasks.forEach(function(task) {
    grunt.loadNpmTasks(task);
  });

  taskConfig.register.forEach(function(record) {
    grunt.registerTask(record.name, record.tasks);
  });
};
