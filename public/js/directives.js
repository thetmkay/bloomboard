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
		controller: ['$scope', '$http','$location', 'sessionService', function ($scope, $http, $location, sessionService){  
		    
			$scope.showLogin = true;

		    $scope.$watch(function() {
			    	return sessionService.activeSession;
			    },
			    function(newVal) {
			    	console.log(newVal)
			    	if(newVal)
			    		$("#loginModal").modal('hide');
			    	else
			    		$("#loginModal").modal('show');
			    });

		    $scope.loginData = function() {
		    	//add some validation?
		    	sessionService.login($scope.login);
		    };
		    $scope.createUser = function() {
		    	//add some validation?
		    	sessionService.register($scope.create);
		    };
		  }]
	};
});
