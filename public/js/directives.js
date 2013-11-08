'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', [])

module.directive('appVersion', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
});
module.directive('fittext', ['$window', '$document',
	function($window, $document) {
		return {
			restrict: 'A',
			scope: true,
			link: function($scope, $element, $attrs) {
				$scope.compressor = $attrs.compressor || 1;
				$scope.minFontSize = $attrs.min || Number.NEGATIVE_INFINITY;
				$scope.maxFontSize = $attrs.max || Number.POSITIVE_INFINITY;

				var resizer = function() {
					$scope.$apply(function() {
						$scope.fontSize = Math.max(
							Math.min(
								$element[0].offsetWidth / ($scope.compressor * 10),
								parseFloat($scope.maxFontSize)
							),
							parseFloat($scope.minFontSize)
						) + 'px';
					});
				};

				angular.element($document).ready(function() {
					resizer();
				});

				angular.element($window).bind('resize', function() {
					resizer();
				});

			}
		}
	}
]);

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
					var boardData =  document.querySelector('bloomboard #boardData');
					boardData.value = sketchpad.json();
					socket.emit('draw', boardData.value);
				});

				socket.on('update_sketch', function(data) {
					console.log('hi');
					sketchpad.json(data);
					element.value = sketchpad.json();
				});
			});
		}
	}
});