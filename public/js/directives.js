'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('clickLogin', function () {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl:'partials/loginmodal',
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

		    var alertOpenHtml = "<div class='alert alert-danger alert-dismissable'>" +
		    "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>";

		    $scope.loginData = function() {
		    	//add some validation?
		    	var success = sessionService.login($scope.login);

		    	if(!success) {
		    		var warningMessage = "The username/password could not be authorized. Please try again.";
		    		console.log("hiiiii")
		    		var submitButton = $("#loginHidden button").before(alertOpenHtml + warningMessage + "</div>");
		    	}
		    };
		    $scope.createUser = function() {
		    	//add some validation?
		    	var success = sessionService.register($scope.create);

		    	if(!success) {
		    		var warningMessage = "There's been an error registering. Please try again.";
		    		console.log("hiiiii")
		    		var submitButton = $("#loginHidden button").before(alertOpenHtml + warningMessage + "</div>");
		    	}
		    };
		  }]
	};
});

module.directive('bloomboard', function(socket) {
	return {
		restrict: "E",
		 replace: true,
		// transclude: true,
		template: '<div id=drawingBoard>' + '<div id="topLeft"></div>' + '<div id="bottomRight"></div>' + '<input type="hidden" id="boardData">' + '</div>',
		scope: true,
		// compile: function(element, attrs) {
		// 	console.log("i got here maxFontSize");


		// },
		link: function(scope, element, attrs) {
			var sketchpad = Raphael.sketchpad("drawingBoard", {
				width: 640,
				height: 480,
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
