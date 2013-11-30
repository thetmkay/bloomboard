'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', []);
module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl: 'partials/loginmodal',
		controller: ['$scope', '$http', '$location', 'sessionService',
			function($scope, $http, $location, sessionService) {

				$("#loginModal").foundation({
						close_on_background_click:false,
						close_on_esc:false
					});

				$scope.externalLogin = function (site) {
					window.location.replace('/auth/' + site);
				};

				// if (sessionService.activeSession) {
				// 	$("#loginModal").modal('show');
				// } 

				$scope.$watch(function() {
						return sessionService.activeSession;
					},
					function(newVal) {
						if (newVal)
							$("#loginModal").foundation('reveal','close');
						else
							$("#loginModal").foundation('reveal','open');
					});

				// $scope.showLogin = true;


				// $scope.checkValidity = function(inputElem) {
				// 	return inputElem.$dirty && inputElem.$invalid;
				// }

				// var alertOpenHtml = "<div id='failAlert' class='alert alert-danger alert-dismissable'>" +
				// 	"<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>";

				// var showFailedLoginMessage = function(warningMessage) {
				// 	$("#loginHidden #failAlert").remove();
				// 	if (warningMessage != null) {
				// 		$("#loginHidden button").before(alertOpenHtml + warningMessage + "</div>");
				// 	}
				// }

				// var showFailedRegisterMessage = function(warningMessage) {
				// 	$("#signUpHidden #failAlert").remove();
				// 	if (warningMessage != null) {
				// 		$("#signUpHidden button").before(alertOpenHtml + warningMessage + "</div>");
				// 	}
				// }

				// $scope.loginData = function() {
				// 	//add some validation?
				// 	if ($(".alert"))
				// 		sessionService.login($scope.login, showFailedLoginMessage);
				// };
				// $scope.createUser = function() {
				// 	//add some validation?
				// 	sessionService.register($scope.create, showFailedRegisterMessage);
				// };
			}
		]
	};
});

module.directive('siteHeader', function() {
	return {
		restrict: "A",
		scope: true,
		replace: true,
		templateUrl: 'partials/homeheader',
		controller: ['$scope', '$location', 'sessionService', function($scope, $location, sessionService) {
			
		}]
	};
});

module.directive('bloomboard', function(socket, persistenceService, sessionService, boardService) {
	return {
		restrict: "E",
		templateUrl: 'partials/bloomboard',
		scope: {
			width: "=",
			height: "="
		},
		compile: function(element, attrs) {
			var css = document.createElement("style");
			css.type = "text/css";
			css.innerHTML = "#drawingBoard { width: " + attrs.width + "px; height: " + attrs.height + "px; }";
			document.body.appendChild(css);
			var sketchpad = Raphael.sketchpad("drawingBoard", {
				width: attrs.width,
				height: attrs.height,
				editing: true
			});

			return function(scope, element, attrs, controller) {



				scope.$parent.$watch('isSelectMode', function(isSelectMode) {
					if (isSelectMode) {
						sketchpad.editing("select");
					} else {
						sketchpad.editing(true);
					}
				});

				persistenceService.getBoardData().then(function(boardInfo) {
					sketchpad.json(boardInfo.data.data, {
						fireChange: false,
						overwrite: true
					});
				});

				socket.on('connect', function() {

					var penID;

					socket.on('penID', function(uPenID) {
						penID = uPenID;
					});

					socket.on('concurrent_users', function(con_pens) {
						sketchpad.add_current_users(con_pens);
					});


					socket.emit('s_new_con_user', {
						'pen': Cereal.stringify(sketchpad.pen())
					});

					sketchpad.change(function() { // need to pass in change instead of finding it out the long way
						var boardData = document.querySelector('#boardData');
						var json = sketchpad.json();
						boardData.value = JSON.stringify(json);
						socket.emit('draw', json[json.length - 1]); // emit added element change
					});

					socket.on('clearBoard', function(data) {
						sketchpad.clear();
					});

					scope.clearBoard = function() {
						socket.emit('s_clearBoard', {});
						sketchpad.clear();
						persistenceService.clearBoard("testBoard2", function(data, info) {

						});
					};

					sketchpad.mousedown(function(e) {
						var x_ = e.pageX;
						var y_ = e.pageY;
						socket.emit('s_con_mouse_down', {
							e: {
								pageX: x_,
								pageY: y_
							},
							id: penID
						});
					});

					sketchpad.mousemove(function(data) {
						if (data) {
							socket.emit('s_con_mouse_move', {
								data: data,
								id: penID
							});
						}
					});

					sketchpad.mouseup(function(path_) {
						socket.emit('s_con_mouse_up', {
							id: penID
						});
					});

					socket.on('con_mouse_down', function(data) {
						sketchpad.con_mouse_down(data, data.id);
					});

					socket.on('con_mouse_move', function(data) {
						sketchpad.con_mouse_move(data, data.id);
					});

					socket.on('con_mouse_up', function(data) {
						console.log("the pen id I recieved is: " + data.id);
						sketchpad.con_mouse_up(data, data.id);
					});

					// socket.on('con_pen_change', function(newPen, userEmail) {
					// 	sketchpad.con_pen_change(newPen, userEmail);
					// });


					socket.on('new_con_user', function(data) {
						sketchpad.new_concurrent_user(data.pen, data.id);
					});

				});

			}
		}
	}
});
