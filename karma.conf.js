// Karma configuration
// Generated on Mon Oct 31 2016 15:12:39 GMT+0000 (GMT)

(function () {
	"use strict";

	module.exports = function (config) {
		config.set({

			// base path that will be used to resolve all patterns (eg. files, exclude)
			basePath: '',


			// frameworks to use
			// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
			frameworks: ['jasmine'],


			// list of files / patterns to load in the browser
			files: [
				'bower_components/angular/angular.min.js',
				'bower_components/angular-mocks/angular-mocks.js',
				'bower_components/angular-animate/angular-animate.min.js',
				'bower_components/angular-aria/angular-aria.min.js',
				'bower_components/angular-material/angular-material.min.js',

				'frontend/test/jasmine/app.js',
				'frontend/project/js/eventService.js',
				'frontend/utils/js/utilsService.js',
				'frontend/home/js/Auth.js',
				'frontend/issues/js/issuesService.js',
				'frontend/issues/js/issueComponent.js',
				'frontend/login/js/loginDirective.js',
				'frontend/test/jasmine/mock_services/serverConfig.js',
				'frontend/test/jasmine/mock_services/notificationService.js',
				'frontend/test/jasmine/mock_services/Auth.js',
				'frontend/test/jasmine/*Spec.js',

				'templates/*.html'
			],


			// list of files to exclude
			exclude: [],


			// preprocess matching files before serving them to the browser
			// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
			preprocessors: {
				'templates/*.html': ['ng-html2js']
			},

			ngHtml2JsPreprocessor: {
				stripPrefix: "templates/",
				moduleName: 'templates'
			},

			// test results reporter to use
			// possible values: 'dots', 'progress'
			// available reporters: https://npmjs.org/browse/keyword/karma-reporter
			reporters: ['progress'],


			// web server port
			port: 9876,


			// enable / disable colors in the output (reporters and logs)
			colors: true,


			// level of logging
			// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
			logLevel: config.LOG_INFO,


			// enable / disable watching file and executing tests whenever any file changes
			autoWatch: true,


			// start these browsers
			// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
			//browsers: ['Chrome'],


			// Continuous Integration mode
			// if true, Karma captures browsers, runs the tests and exits
			singleRun: false,

			// Concurrency level
			// how many browser should be started simultaneous
			concurrency: Infinity
		});
	};
}());