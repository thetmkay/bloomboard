'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', []);


module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl: 'partials/loginmodal',
		link: function postLink(scope,iElement,iAttrs){
			scope.showExplanation = false;
		},
		controller: ['$scope', '$http', '$location', 'sessionService',
			function($scope, $http, $location, sessionService) {

				$scope.externalLogin = function (site) {
					window.location.replace('/auth/' + site);
				};

				// if (sessionService.activeSession) {
				// 	$("#loginModal").slideDown();
				// } 

				// $scope.$watch(function() {
				// 		return sessionService.activeSession;
				// 	},
				// 	function(newVal) {
				// 		if (newVal)
				// 			$("#loginModal").hide();
				// 		else
				// 			$("#loginModal").slideDown();
				// 	});
			}
		]
	};
});

module.directive('userList', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/boarduserlist',
		link: function postLink(scope,iElement,iAttrs) {

			scope.editors = [
				{
					displayName: 'George', access: true, writing: true
				},
				{
					displayName: 'Leo', access: true, writing: false
				},
				{
					displayName: 'Tom', access: true, writing: true
				}
			];

			scope.expandedEditors = 'more';
			scope.numEditors = 1;

			scope.followers = [
				{
					displayName: 'Miten', access: false
				},
				{
					displayName: 'Niket', access: false
				},
				{
					displayName: 'Yufei', access: false
				}
			];

			scope.expandedFollowers = 'more';
			scope.numFollowers = 1;

			//ewww clean up in to one function later

			scope.showMoreEditors = function()
			{
				if(scope.expandedEditors == 'hide')
				{
					scope.numEditors = 1;
					scope.expandedEditors = 'more';
				}
				else
				{
					scope.numEditors = scope.editors.length;
					scope.expandedEditors = 'hide';
				}
			};

			scope.showMoreFollowers = function()
			{
				if(scope.expandedFollowers == 'hide')
				{
					scope.numFollowers = 1;
					scope.expandedFollowers = 'more';
				}
				else
				{
					scope.numFollowers = scope.followers.length;
					scope.expandedFollowers = 'hide';
				}
			};

		}
	}
});

module.directive('needAccess', function() {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		templateUrl: 'partials/blockaccess',
		controller: ['$scope', 'sessionService', function($scope, sessionService) {

			var loginID = "#loginModal"

			if(sessionService) {
				$scope.$watch(function() {
							return sessionService.activeSession;
						},
						function(newVal) {
							if (newVal)
							{
								$("#blockAccess").hide();
							}
							else
							{
								$("#blockAccess").slideDown();
								$(loginID).slideDown();
							}
						});
			}

			$scope.openLogin = function() {
				$(loginID).slideDown();
			}
		}]
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
				var spinHtml = '<div class="multiRectSpin"><div class="rect1"></div>'
				+ '<div class="rect2"></div><div class="rect3"></div>'
				+ '<div class="rect4"></div><div class="rect5"></div></div>';

				iElement.parent().replaceWith(spinHtml);
				
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
			console.log(iElement);
			$(iElement).find("#boardName").on('click', function() {
				$("#boardNameTextBox").show();
				$("#boardNameTextBox input").focus();
				$(this).hide();
			});

			$("#boardNameTextBox input").on('blur', function() {
				console.log('focout');
				$("#boardName").show();
				$("#boardNameTextBox").hide();
			});

			$("#boardNameTextBox input").on('keypress', function(event) {
				if(event.which == 13)
				{
					$("#boardName").show();
					$("#boardNameTextBox").hide();
				}
			});

			$("#menuToolButton").on("click", function() {
				if($(this).hasClass("hoverIcon"))
				{
					$(this).removeClass("hoverIcon");
					$("#toolsMenu").hide();
				}
				else
				{
					$(this).addClass("hoverIcon");
					$("#toolsMenu").show();
				}
			})

			var toolbar = drawService.toolbar.tools;
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

module.directive("drawingBoard", ['drawService', function(drawService) {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/bloomboard'
	};
}]);

module.directive('siteHeader', function() {
	return {
		restrict: "A",
		scope: true,
		replace: true,
		templateUrl: 'partials/siteheader',
		controller: ['$scope', '$location', 'sessionService', function($scope, $location, sessionService) {

	      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
	      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});


	      $(document).foundation('tooltip', {disable_for_touch:true});
	      $(document).foundation('topbar', {
	        is_hover: false,
	        mobile_show_parent_link: true
	      });
	      ///refactor this shit
	      $scope.clickLogout = function () {
	      	$location.path("/home");
	        sessionService.logout();
	      };
	      $("#logoutButton").on("click", function(e){$scope.clickLogout();});
	      
	      $scope.clickLogin = function() {
	        $("#loginModal").slideToggle();
	      };

	      $scope.clickCreateBoard = function() {
	        //double check
	          $location.path('/createBoard');
	      };

	      $scope.clickBoards = function() {
	        //double check
	          $location.path('/boards');
	      };
		}]
	};
});

module.directive('bloomboard', function(socket, persistenceService, sessionService, drawService, boardService) {
	return {
		restrict: "E",
		templateUrl: 'partials/bloomboard',
		scope: {
		},
		compile: function(element, attrs) {
			// var css = document.createElement("style");
			// css.type = "text/css";
			// css.innerHTML = "#drawingBoard { width: " + attrs.width + "px; height: " + attrs.height + "px; }";
			// document.body.appendChild(css);
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

   				var toolbar = drawService.toolbar.tools;
   				
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
					sketchpad.clearSelected();
					var paper = sketchpad.paper();
					var svg = paper.toSVG();

					canvg('canvas', svg);
					var img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

					var a = document.createElement('a');
					a.href = img;
					a.download = boardService.name + ".png";
					a.click();

					canvas.parentNode.removeChild(canvas);
					a.parentNode.removeChild(a);

				};
				drawService.bind(toolbar.save);
   			};
     		

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
							console.log(JSON.stringify(uPenID, null, 4));
							penID = uPenID;
						});

						socket.on('concurrent_users', function(data) {
							sketchpad.add_current_users(data.con_pens);
							console.log(JSON.stringify(data.users, null, 4));
						});

						socket.on('clearBoard', function(data) {
							console.log('clear');
							sketchpad.clear();
						});

						socket.emit('s_new_con_user', {
							'pen': Cereal.stringify(sketchpad.pen())
						});

						socket.on('con_mouse_down', function(data) {
							console.log('con_mouse_down');
							sketchpad.con_mouse_down(data, data.id);
						});

						socket.on('con_mouse_move', function(data) {
							console.log('con_mouse_move');
							sketchpad.con_mouse_move(data, data.id);
						});

						socket.on('con_mouse_up', function(data) {
							console.log("the pen id I recieved is: " + data.id);
							sketchpad.con_mouse_up(data, data.id);
						});

						socket.on('con_pen_change', function(newPen, userEmail) {
							console.log('con_pen_change');
							sketchpad.con_pen_change(newPen, userEmail);
						});


						socket.on('new_con_user', function(data) {
							sketchpad.new_concurrent_user(data.pen, data.id);
							console.log('new user');
							console.log(JSON.stringify(data.user, null, 4));
						});

						socket.on('leaving_user', function (user) {
							console.log('leaving user');
							console.log(JSON.stringify(user, null, 4));
						});

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
									socket.emit('s_con_mouse_down',{
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
						socket.removeAllListeners('connect');
						socket.removeAllListeners('penID');
						socket.removeAllListeners('concurrent_users');
						socket.removeAllListeners('clearBoard');
						socket.removeAllListeners('con_mouse_down');
						socket.removeAllListeners('con_mouse_move');
						socket.removeAllListeners('con_mouse_up');
						socket.removeAllListeners('con_pen_change');
						socket.removeAllListeners('new_con_user');
						socket.removeAllListeners('leaving_user');
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
