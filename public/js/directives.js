'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl:'partials/loginmodal',
		controller: ['$scope', '$http','$location', 'sessionService', function ($scope, $http, $location, sessionService){  
		    
			if(sessionService.activeSession)
			{
				$("#loginModal").modal('show');
			}

			$scope.$watch(function() {
					return sessionService.activeSession;
				},
				function(newVal) {
					console.log(newVal)
					if (newVal)
						$("#loginModal").modal('hide');
					else
						$("#loginModal").modal('show');
				});

			$scope.showLogin = true;

		    
			var alertOpenHtml = "<div id='failAlert' class='alert alert-danger alert-dismissable'>" +
				    "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>";

		    var showFailedLoginMessage = function(warningMessage)
		    {
		    	$("#loginHidden #failAlert").remove();
		    	$("#loginHidden button").before(alertOpenHtml + warningMessage + "</div>");
		    }

		    var showFailedRegisterMessage = function(warningMessage)
		    {	
		    	$("#signUpHidden #failAlert").remove();
		    	$("#signUpHidden button").before(alertOpenHtml + warningMessage + "</div>");
		    }

		    $scope.loginData = function() {
		    	//add some validation?
		    	if($(".alert"))
		    	sessionService.login($scope.login, showFailedLoginMessage);
		    };
		    $scope.createUser = function() {
		    	//add some validation?
		    	sessionService.register($scope.create, showFailedRegisterMessage);
		    };
		  }]
	};
});

module.directive('bloomboard', function(socket, persistenceService) {
	return {
		restrict: "E",
		// replace: true,
		// transclude: true,
		template: '<div id=drawingBoard>' + '<div id="topLeft"></div>' + '<div id="bottomRight"></div>' + '<input type="hidden" id="boardData">' + '</div>',
		scope: {
			width: "=",
			height: "="
		},
		// compile: function(element, attrs) {
		// 	console.log("i got here maxFontSize");


		// },
		link: function(scope, element, attrs) {
			var css = document.createElement("style");
			css.type = "text/css";
			css.innerHTML = "#drawingBoard { width: " + scope.width + "px; height: " + scope.height + "px; }";
			document.body.appendChild(css);
			var sketchpad = Raphael.sketchpad("drawingBoard", {
				width: scope.width,
				height: scope.height,
				editing: true
			});

			persistenceService.getBoardData().then(function(boardInfo) {
				console.log("i get here");
				console.log(boardInfo.data.data);
				sketchpad.json(boardInfo.data.data, {
					fireChange: false
				});

			});

			socket.on('connect', function() {
				sketchpad.change(function() {
					var boardData = document.querySelector('#boardData');
					console.log(sketchpad.json());
					var json = sketchpad.json();
					boardData.value = JSON.stringify(json);
					// console.log(boardData.value);
					socket.emit('draw', json);
				});

				socket.on('update_sketch', function(data) {
					// for (int i = 0; i < data;)
					sketchpad.json(data, {
						fireChange: false
					});
				});

			});

			// sketchpad.json(persistenceService.boardData.data, {
			// 	fireChange: false
			// });

		}
	}
});
