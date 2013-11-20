// Karma configuration

module.exports = function (config) {
  config.set({


// base path, that will be used to resolve files and exclude
basePath: '',

frameworks: ['jasmine'],

// list of files / patterns to load in the browser
files: ['public/js/lib/angular/angular.min.js', 'public/js/lib/angular/angular-mocks.js', 'public/js/lib/angular/angular-ui-router.min.js', 'public/js/lib/*.js', 'public/js/*.js', 'test/client/**/*.js', 'public/js/lib/angular/angularjs-fittext.js'],


// list of files to exclude
exclude: [

],

preprocessors: {
	'**/public/js/*.js': 'coverage'
},

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters: ['progress', 'coverage'],

coverageReporter: {
	type: 'html',
	dir: 'test/coverage/'
},

// web server port
port: 9876,


// cli runner port
runnerPort: 9100,


// enable / disable colors in the output (reporters and logs)
colors: true,


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel: config.LOG_INFO,


// enable / disable watching file and executing tests whenever any file changes
autoWatch: false,


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers: ['PhantomJS'],

//plugins
// plugins: [
//     'karma-coverage'
// ],


// If browser does not capture in given timeout [ms], kill it
captureTimeout: 60000,


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun: true
});
}