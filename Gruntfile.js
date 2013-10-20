module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'public/**/*.js', 'test/**/*.js', 'app.js', '!public/js/lib/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    'node-inspector': {
      dev: {
        options: {
          'web-port': 4000,
          'web-host': 'localhost',
          'debug-port': 5858
        }
      }
    },
    nodemon: {
      dev: {
        ignoredFiles: ['README.md', 'node_modules/**', 'public/**'],
        options: {
          nodeArgs: ['--debug']
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'node-inspector', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    karma: {
      unit: {
        options: {
          autoWatch: true,
          files: ['test/karma/**/*.js']
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: []
    },
    // simplemocha: {
    //   options: {
    //     globals: ['should'],
    //     timeout: 3000,
    //     ignoreLeaks: false,
    //     grep: '*mocha-test',
    //     ui: 'bdd',
    //     reporter: 'tap'
    //   },

    //   all: {
    //     src: ['test/mocha/**.js']
    //   }
    // }*/
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('test', ['karma', 'simplemocha']);

  grunt.registerTask('default', ['concurrent:dev']);

};