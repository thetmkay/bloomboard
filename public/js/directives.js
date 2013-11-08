'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

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

module.directive('bloomboard', function(socket) {
	return {
		restrict: "E",
		// replace: true,
		// transclude: true,
		template: '<div id="topLeft"></div>' + '<div id="bottomRight"></div>' + '<input type="hidden" id="boardData">',
		scope: {
			width: "=",
			height: "="
		},
		// compile: function(element, attrs) {
		// 	console.log("i got here maxFontSize");


		// },
		link: function(scope, element, attrs) {
			var paper = new Raphael(element);
			var sketchpad = Raphael.sketchpad(paper, {
				width: scope.width,
				height: scope.height,
				editing: true
			});

			socket.on('connect', function() {
				sketchpad.change(function() {
					console.log("hello");
					var boardData = document.querySelector('bloomboard #boardData');
					boardData.value = sketchpad.json();



					socket.emit('draw', boardData.value);
				});

			});

			socket.on('update_sketch', function(data) {
				console.log('hi');
				sketchpad.json(data, {fireChange: false});
				// element.value = sketchpad.json();
			});
		}
	}
});
