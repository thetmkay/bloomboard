'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });

module.directive('clickLogin', function () {
	return {
		restrict: 'A',
		scope: true,
		controller: ['$scope', '$http', '$location', LoginCtrl]
	};
});