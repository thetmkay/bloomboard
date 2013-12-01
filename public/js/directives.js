'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', []);


module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: {
			escapable: '='
		},
		replace: true,
		templateUrl: 'partials/loginmodal',
		link: function postLink(scope,iElement,iAttrs){
			
			var options;

			if(scope.escapable) {
				options = {
					close_on_background_click:false,
					close_on_esc:false
				}
			}
			else 
			{
				options = {
					close_on_background_click:false,
					close_on_esc:false
				}
			}

			scope.showExplanation = false;

			$("#loginModal").foundation(options);
		},
		controller: ['$scope', '$http', '$location', 'sessionService',
			function($scope, $http, $location, sessionService) {

<<<<<<< HEAD


				$scope.externalLogin = function (site) {
					window.location.replace('/auth/' + site);
				};

				// if (sessionService.activeSession) {
				// 	$("#loginModal").modal('show');
				// } 
=======
				if (sessionService.activeSession) {
					$("#loginModal").modal('show');
				}
>>>>>>> master

				$scope.$watch(function() {
						return sessionService.activeSession;
					},
					function(newVal) {
						if (newVal)
							$("#loginModal").foundation('reveal','close');
						else
<<<<<<< HEAD
							$("#loginModal").foundation('reveal','open');
					});
=======
							$("#loginModal").modal('show');
					}); 
>>>>>>> master

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

module.directive('activeNav', ['$state',function($state) {
	return {
		restrict: "A",
		replace: false,
		scope: true,
		template: "",
		link: function(scope, iElement, iAttrs) {

			// scope.$watch(function() {
			// 	return $state.current.name;
			// }, function(newState) {
			// 	if(newState == iAttrs.forstate)
			// 		iElement.addClass("active");
			// 	else
			// 		iElement.removeClass("active");
			// })
		}
	};
}]);

module.directive('authIcon', function() {
	return {
		restrict: "A",
		replace: false,
		scope: true,
		template: "",
		link: function(scope, iElement, iAttrs) {
			$(iElement).on('click',function() {
				var spinHtml = '<div class="spinStyle"><i class="fa fa-spinner fa-spin fa-3x"></i></div>';
				iElement.parent().parent().replaceWith(spinHtml);
				
				window.location.replace('/auth/' + iAttrs.authprovider);
			});
		}
	};
});

module.directive("drawingToolbar", ['boardService', 'drawService', function(boardService, drawService) {
	return {
		restrict:'E',
		replace: true,
		scope: true,
		templateUrl: "partials/drawingbar",
		link: function(scope, iElement, iAttrs) {
			scope.boardName = boardService.name || 'board';

			var toolbar = drawService.toolbar

			toolbar.clear.id = "#deleteToolButton";
			drawService.bind(toolbar.clear);

			toolbar.draw.id = "#pencilToolButton";
			drawService.bind(toolbar.draw);

			toolbar.select.id = "#selectToolButton";
			drawService.bind(toolbar.select);

			scope.$watch(function() {
				return boardService.name;
			}, function(newVal) {
				scope.boardName = newVal;
			})
		}
	}
}]);

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

module.directive('bloomboard', function(socket, persistenceService, sessionService, boardService, drawService) {
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

				var toolbar = drawService.toolbar;

				scope.isSelectMode = false;
     
			    toolbar.draw.press = function() {
			      console.log("draw");
			      scope.isSelectMode = false;
			      sketchpad.editing(true);
				  sketchpad.clearSelected();
			    };
			    drawService.bind(toolbar.draw);

			    toolbar.select.press = function() {
			      console.log("select");
			      scope.isSelectMode = true;
			      sketchpad.editing("select");
			    };
			    drawService.bind(toolbar.select);

				scope.exportPng = function() {
					var canvas = document.createElement('canvas');
					canvas.id = 'canvas';
					canvas.width =  attrs.width;
					canvas.height = attrs.height;
					document.body.appendChild(canvas);
					var paper = sketchpad.paper();
					var svg = paper.toSVG();

					canvg('canvas', svg);
					var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

					var a = document.createElement('a');
					a.href = img;
					a.download = 'bloomboard.png';
					a.click();

					canvas.parentNode.removeChild(canvas);
					a.parentNode.removeChild(a);

				};


				persistenceService.getBoardData(boardService._id).then(function(boardInfo) {
					sketchpad.json(boardInfo.data.data, {
						fireChange: false,
						overwrite: true
					});
				});

				socket.on('connect', function() {

					socket.emit('joinBoard', boardService._id);


					console.log("hello");

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
						console.log("deleting board...");
						socket.emit('s_clearBoard', {});
						sketchpad.clear();
						persistenceService.clearBoard(boardService._id, function(data, info) {

						});
					};
					toolbar.clear.press = scope.clearBoard;
					drawService.bind(toolbar.clear);

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
