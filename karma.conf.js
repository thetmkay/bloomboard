// Karma configuration

module.exports = function(config) {
	config.set({


		// base path, that will be used to resolve files and exclude
		basePath: '',

		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: ['public/js/lib/angular/angular.min.js',
			'public/js/lib/angular/angular-mocks.js',
			'public/js/lib/angular/angular-ui-router.min.js',
			'public/js/lib/*.js',
			'public/js/*.js',
			'public/js/lib/foundation/*.js',
			'public/js/lib/foundation/components/*.js',
			'test/client/**/*.js',
			'public/js/lib/angular/angularjs-fittext.js',
			'test/jasmine-fixture.js'
		],


		// list of files to exclude
		exclude: [

		],

		preprocessors: {
			'**/public/js/*.js': ['coverage'],
			'**/public/js/lib/raphael.sketchpad.js': ['coverage']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit'
		reporters: ['dots', 'progress', 'coverage'],

		coverageReporter: {
			reporters: [{
				type: 'html',
				dir: 'coverage/'
				// file: 'coverage.txt'
			}, {
				type: 'text-summary'
			}]
		},

		// web server port
		port: 9876,


		// cli runner port
		runnerPort: 9100,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_DISABLE,


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
		// 	'karma-jasmine',
		//     'karma-coverage',
		//     'karma-phantomjs-launcher'
		// ],


		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
}