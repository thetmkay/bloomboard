'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl: 'partials/login',
		controller: ['$scope', '$http', '$location', 'sessionService',
			function($scope, $http, $location, sessionService) {

				$scope.showLogin = true;

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

				$scope.loginData = function() {
					//add some validation?
					sessionService.login($scope.login);
				};
				$scope.createUser = function() {
					//add some validation?
					sessionService.register($scope.create);
				};
			}
		]
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

			sketchpad.json(persistenceService.boardData.data, {
				fireChange: false
			});

			socket.on('connect', function() {
				sketchpad.change(function() {
					var boardData = document.querySelector('#boardData');
					boardData.value = sketchpad.json();
					socket.emit('draw', boardData.value);
				});

			});

			socket.on('update_sketch', function(data) {
				sketchpad.json(data, {
					fireChange: false
				});
			});
		}
	}
});