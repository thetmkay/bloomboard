'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });

module.directive('testDirective', function () {
	return {
		restrict: 'A',
		scope: true,
		replace:true,
		templateUrl: "partials/test",
		controller: ['$scope', '$http', '$location', function($scope,$http,$location) {
			console.log("yooo");
		}],
	};
});

module.directive('clickLogin', function () {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl:'partials/login',
		controller: ['$scope', '$http', '$location', function($scope,$http,$location) {
			console.log("hi");
			$("#myModal").modal('show');
		}],
	};
});
