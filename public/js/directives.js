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
			scope.boardName = boardService.name;

			var toolbar = drawService.toolbar

			toolbar.clear.id = "#deleteToolButton";
			drawService.bind(toolbar.clear);

			toolbar.draw.id = "#pencilToolButton";
			drawService.bind(toolbar.draw);

			toolbar.select.id = "#selectToolButton";
			drawService.bind(toolbar.select);

			toolbar.save.id = "#saveToolButton";
			drawService.bind(toolbar.save);

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

module.directive('bloomboard', function(socket, persistenceService, sessionService, drawService, boardService) {
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
				editing: 'select'
			});

			return function(scope, element, attrs, controller) {
				var boardID = scope.$parent.boardID;
				var boardName;
				scope.isSelectMode = false;
     			
   			var initToolbar = function () {

   				var toolbar = drawService.toolbar;
   				


   				scope.$watch(function() {
   					return boardService.canEdit;
   				}, function (canEdit) {
   					if (canEdit) {
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

					    toolbar.clear.press = function() {
								console.log("deleting board...");
								socket.emit('s_clearBoard', {});
								sketchpad.clear();
								persistenceService.clearBoard(boardID, function(data, info) {
								});
							};
							drawService.bind(toolbar.clear);

							toolbar.draw.press();
   					}
   				});
     		  

					toolbar.save.press = function() {
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

					drawService.bind(toolbar.save);

					
   			};
			    
     		console.log('hello');
     		console.log(scope.$parent.boardID);
     		

     		var load = function () {
					persistenceService.getBoardData(boardID, function(boardInfo) {
						
						$(".spinStyle").remove();

						boardName = boardInfo.name;
						scope.$parent.boardName = boardName;
						sketchpad.json(boardInfo.data, {
							fireChange: false,
							overwrite: true
						});


						initToolbar();

						socket.on('connect', function() {
							console.log('connected');
						});

						socket.emit('joinBoard', boardID);

						

						var penID;

						socket.on('penID', function(uPenID) {
							penID = uPenID;
						});

						socket.on('concurrent_users', function(con_pens) {
							sketchpad.add_current_users(con_pens);
						});

						socket.on('clearBoard', function(data) {
							sketchpad.clear();
						});

						socket.emit('s_new_con_user', {
							'pen': Cereal.stringify(sketchpad.pen())
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

						console.log('###' + boardService.canEdit);

						scope.$watch(function() {
							return boardService.canEdit;
						}, function (canEdit) {
							if (canEdit) {
								sketchpad.change(function() { // need to pass in change instead of finding it out the long way
									var boardData = document.querySelector('#boardData');
									var json = sketchpad.json();
									boardData.value = JSON.stringify(json);
									var data = json[json.length - 1];
									if (data) {
										socket.emit('draw', data); // emit added element change
									}
								});

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
							} else {
								sketchpad.editing(false);
							}
						});						
					});

					scope.$parent.leaveBoard = function () {
						socket.emit('leaveBoard');
					};
				};

				if (sessionService.activeSession) {
     			load();
     		}

				



			}
		}
	}
});
