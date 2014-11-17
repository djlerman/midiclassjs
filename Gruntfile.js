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
    jsdoc: {
      dist: {
        src: ['dist/<%= pkg.name %>.js'],
        options: {
          destination: 'docs/api/',
          configure: 'etc/jsdoc.conf'
        }
      }
    },
    docco: {
      debug: {
        src: ['js/*.js'],
        options: {
          output: 'docs/code/'
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
    qunit: {
	all: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'js/**/*.js', 'tests/*.js'],
      options: {
        // options here to override JSHint defaults
        browserify: true,
        browser: true,
        jshintrc: 'etc/jshintrc'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'browserify', 'docco', 'markdown', 'jsdoc']
    }
  });

  /**
   * We need to load the previously de
   */
  var taskConfig = {
    tasks: [
      'grunt-contrib-uglify',
      'grunt-contrib-jshint',
      'grunt-contrib-qunit',
      'grunt-contrib-watch',
      'grunt-browserify',
      'grunt-jsdoc',
      'grunt-docco',
      'grunt-markdown'
    ],
    register: [{
      name: 'test',
      tasks: ['jshint', 'qunit']
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
