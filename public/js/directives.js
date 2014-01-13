'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', []);


module.directive('colorpicker', function(){
  return {
  	restrict: 'C',
    require: '?ngModel',
    link: function (scope, elem, attrs, ngModel) {
      elem.spectrum();
      if (!ngModel) return;
      ngModel.$render = function () {
        elem.spectrum('set', ngModel.$viewValue || '#fff');
      };
      elem.on('change', function () {
        scope.$apply(function () {
          ngModel.$setViewValue(elem.val());
        });
      });
    }
  }
});

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


module.directive('userList', ['socket', 'sessionService', 'boardService', function (socket, sessionService, boardService) {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/boarduserlist',
		link: function postLink(scope,iElement,iAttrs) {

			socket.on('change_board_name', function (newName) {
				boardService.setName(newName);
			});

			scope.$parent.leaveBoard.push(function () {
				socket.removeAllListeners('change_board_name');
				socket.emit('remove_change_name');
			});



			scope.$watch(function() {return boardService.canEdit;}, function(canEdit) { 
				scope.canEdit = canEdit;
				if(canEdit)
				{
					$(iElement).find("#boardNameLabel").on('click', function() {
						$("#boardName > #boardNameTextBox").show();
						$("#boardName #boardNameTextBox input").focus();
						$(this).hide();
					});
				}
				else
				{
					$(iElement).find("#boardName").unbind();
				}
			});

			scope.boardName = boardService.name || "...";

			

			var newName = function () {
				$("#boardNameLabel").show();
				$("#boardNameTextBox").hide();
				var newBoardName = $("#boardNameTextBox input")[0].value;
				console.log(newBoardName);
				socket.emit('new_board_name', {newBoardName: newBoardName});
			};

			scope.$watch(function() {
				return boardService.name;
			}, function(newVal) {
				scope.boardName = newVal;
			})

			$("#boardNameTextBox input").on('blur', newName);

			$("#boardNameTextBox input").on('keypress', function(keyevent) {
				if(keyevent.which == '13')
				{
					newName();
				}
			});


			scope.editors = {};
			scope.followers = {};

			socket.on('live_users', function (users) {
				scope.editors = users.write;
				scope.followers = users.read;
			});

			socket.on('new_live_user', function (data) {
				if (data.user === sessionService.username)
					return;
				if (scope[data.type][data.user]) {
					++scope[data.type][data.user].instances;
				} else {
					scope[data.type][data.user] = {
						instances: 1,
						writing: false
					};
				}
			});	

			socket.on('editing', function (data) {
				scope.editors[data.user].writing = true;
			});

			socket.on('not_editing', function (data) {
				scope.editors[data.user].writing = false;
			});

			socket.on('leaving_user', function (data) {
				if (scope[data.type][data.user]) {
					if (scope[data.type][data.user].instances === 1) {
						delete scope[data.type][data.user];
					} else {
						--scope[data.type][data.user].instances;
					}
				}
			});

			scope.$parent.leaveBoard.push(function () {
				socket.removeAllListeners('live_users');
				socket.removeAllListeners('new_live_user');
				socket.removeAllListeners('editing');
				socket.removeAllListeners('not_editing');
				socket.removeAllListeners('leaving_user');
				socket.removeAllListeners('live_switch');
				socket.removeAllListeners('deleted_live_user');
			});

			socket.on('live_switch', function (data) {
				var old = (data.type === 'editors') ? 'followers' : 'editors';
				var details = scope[old][data.username];
				delete scope[old][data.username];
				scope[data.type][data.username] = details;
			});

			socket.on('deleted_live_user', function (data) {
				delete scope[data.type][data.username];
			});



			scope.defaultShown = 3;

			scope.expandedEditors = 'show';
			scope.numEditors = scope.defaultShown;

			scope.expandedFollowers = 'show';
			scope.numFollowers = scope.defaultShown;

			//ewww clean up in to one function later

			scope.showMoreEditors = function()
			{
				if(scope.expandedEditors == 'hide')
				{
					scope.numEditors = scope.defaultShown;
					scope.expandedEditors = 'show';
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
					scope.numFollowers = scope.defaultShown;
					scope.expandedFollowers = 'more';
				}
				else
				{
					scope.numFollowers = scope.followers.length;
					scope.expandedFollowers = 'hide';
				}
			};

			$("#editModal").on("click", function()
			{
				$("#myModal").foundation('reveal', 'open');
			});

		}
	}
}]);

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

module.directive("drawingToolbar", ['boardService', 'drawService', 'socket', function (boardService, drawService, socket) {
	return {
		restrict:'E',
		replace: true,
		scope: true,
		templateUrl: "partials/drawingbar",
		link: function(scope, iElement, iAttrs) {

			socket.on('change_board_name', function (newName) {
				boardService.setName(newName);
			});

			scope.$watch('pencolor', function() {
				drawService.pencolor = scope.pencolor;
			});

			socket.on('activate_board', function () {

			});

			socket.on('lock_board', function () {

			});

			scope.$parent.leaveBoard.push(function () {
				socket.removeAllListeners('change_board_name');
				socket.removeAllListeners('activate_board');
				socket.removeAllListeners('lock_board');
				socket.emit('remove_change_name');
			});
			
			scope.canEdit = boardService.canEdit;

			scope.$watch(function() {
				return boardService.canEdit
			}, function (canEdit) {
				scope.canEdit = canEdit;
			});

			scope.$watch('pencolor', function() {
				drawService.pencolor = scope.pencolor;
			});

			var toggleMenu = function() {
				$('.toolMenu').slideUp();
				var menu = $(this).attr("data-target");
				if($(this).hasClass("hoverIcon"))
				{
					$(".toggleMenu").removeClass("hoverIcon");
				}
				else
				{
					$(this).addClass("hoverIcon");
					$(menu).slideDown();
				}
			}

			$(".toggleMenu").on("click", toggleMenu);

			var toolbar = drawService.toolbar.tools;
			toolbar.clear.id = ".deleteToolButton";
			drawService.bind(toolbar.clear);

			toolbar.draw.id = ".pencilToolButton";
			toolbar.draw.icon = "fa-pencil";
			drawService.bind(toolbar.draw);

			toolbar.select.id = ".selectToolButton";
			toolbar.select.icon = "fa-hand-o-up";
			drawService.bind(toolbar.select);

			toolbar.pan.id = ".panToolButton";
			toolbar.pan.icon = "fa-plus";
			drawService.bind(toolbar.pan);

			toolbar.save.id = ".saveToolButton";
			drawService.bind(toolbar.save);

			drawService.toolbar.modeclass = toolbar.draw.icon;
		}
	}
}]);

module.directive("editModal", function() {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		templateUrl: 'partials/editModal',
		link: function($scope,iElement, iAttrs) {
			var options = {};
			$("#myModal").foundation('reveal',options);
		}
	}
})

module.directive("editPage", ['$location', 'boardService', 'sessionService', '$http', 'socket', function($location,boardService,sessionService, $http, socket) {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		templateUrl: 'partials/editBoard',
		link:  function($scope, iElement, iAttrs) {

			$scope.canEdit = false;
			$scope.username = sessionService.username;
	        
			socket.on('refreshEdit', function (details) {
				
				if (details.hasOwnProperty('canEdit'))
					$scope.canEdit = details.canEdit;
				


				$scope.boardID = details.boardID;
				$scope.boardName = details.name;
				
				$scope.writeAccess = details.writeAccess;
				$scope.readAccess = details.readAccess;
				if ($scope.canEdit) {
					 $scope.addAccessClick = function () {
            var send = {
              usernames: {
                writeAccess: [],
                readAccess: []
              }
            };
            if ($scope.hasOwnProperty('addWriteAccess')) {
              send.usernames.writeAccess = $scope.addWriteAccess.split(/;| |,/).filter(function (username) {
                return username.length !== 0;
              });
            }
            if ($scope.hasOwnProperty('addReadAccess')) {
              send.usernames.readAccess = $scope.addReadAccess.split(/;| |,/).filter(function (username) {
                return username.length !== 0;
              });

            }
            delete $scope.addWriteAccess;
            delete $scope.addReadAccess;
            socket.emit('new_access', send);
          };

          $scope.deleteBoard = function () {
          	$("#myModal").foundation('reveal','close');
          	socket.emit('delete_board');


            // $http.post('/api/deleteBoard', {boardID: boardService._id}).
            //   success(function (data, status) {
            //     $location.path('/boards');
            //   });
          };

          $scope.switchAccess = function (username, access) {
            console.log(access);
            var send = {
              username: username,
              currentAccess: access
            };
            socket.emit('switch_access', send);
          };

          $scope.removeAccess = function (username) {
            var send = {
              username: username
            };

            socket.emit('remove_access', send);
          };
				} else {
					delete $scope.addAccessClick;
					delete $scope.deleteBoard;
					delete $scope.switchAccess;
					delete $scope.removeAccess;
				}
			});
			
			scope.$parent.leaveBoard.push(function () {
				socket.removeAllListeners('refreshEdit');
			});


		}
	};
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
		controller: ['$scope', '$location', '$http', 'sessionService', function($scope, $location, $http, sessionService) {

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
	      $(".logoutButton").on("click", function(e){$scope.clickLogout();});
	      
	      $scope.clickLogin = function() {
	        $("#loginModal").slideToggle();
	      };

	      $scope.clickCreateBoard = function() {
	        $http.get('/api/createBoard').
	          success(function (data, status) {
	            $location.path('/board/' + data._id + '/untitled');
	          }).
	          error(function (data, status) {

	          });
	      };

	      $scope.clickBoards = function() {
	        //double check
	          $location.path('/boards');
	      };
		}]
	};
});

module.directive('boardNav', function () {
	return {
		restrict: 'E',
		scope: true,
		replace: true,
		templateUrl: 'partials/boardnav',
		link: function(scope, iElement, iAttrs) {

			$("#scrollDown").on('click', function() {
				console.log("scroll down");
				$("bloomboard").on("click", function(event) {
					event.stopPropogation();
				})
			});

			$("#scrollUp").on('click', function() {
				console.log("scroll up");
				$("bloomboard").scrollTop($("bloomboard").scrollTop() - 100);
			})

			var switchView = function(pageID) {
				$('.boardpage').hide();
				$(pageID).show();
				$('.navIconSelect').removeClass('navIconSelect');
				
			};

			$("#boardUserButton").on('click', function() {switchView('#boardPage > #boardUsers');$(this).addClass('navIconSelect');});
			$("#boardDrawButton").on('click', function() {switchView('#boardPage > #boardContainer');$(this).addClass('navIconSelect');});
			$("#boardEditButton").on('click', function() {switchView('#boardPage > #boardEdit');$(this).addClass('navIconSelect');});
		}
	}
})


module.directive('bloomboard', function(socket, persistenceService, sessionService, drawService, boardService, $location) {
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
   				
			    toolbar.pan.press = function() {
			      console.log("pan");

			      scope.isSelectMode = false;
			      sketchpad.editing("pan");
			    }
			    drawService.bind(toolbar.pan);


   				scope.$watch(function() {
   					return boardService.canEdit;
   				}, function (canEdit) {
   					if (canEdit) {
   						toolbar.draw.press = function() {
					      scope.isSelectMode = false;
					      sketchpad.editing(true);
						  	sketchpad.clearSelected();
					    };
					    drawService.bind(toolbar.draw);

					    toolbar.select.press = function() {
					      scope.isSelectMode = true;
					      sketchpad.editing("select");
					    };
					    drawService.bind(toolbar.select);



					    toolbar.clear.press = function() {
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

						var activate = function () {
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
						};

						var deactivate = function () {
							sketchpad.change();
							sketchpad.mousedown();
							sketchpad.mousemove();
							sketchpad.mouseup();
							sketchpad.editing(false);
						};
						
						//$(".spinStyle").remove();

						boardName = boardInfo.name;
						scope.$parent.boardName = boardName;
						sketchpad.json(boardInfo.data, {
							fireChange: false,
							overwrite: true
						});

						var topFn = function() {
							$("bloomboard").scrollTop($("bloomboard").scrollTop() - 10);
						};

						var bottomFn = function() {
							$("bloomboard").scrollTop($("bloomboard").scrollTop() + 10);
						}

						var rightFn = function() {
							$("bloomboard").scrollLeft($("bloomboard").scrollLeft() - 10);
						}

						var leftFn = function() {
							$("bloomboard").scrollLeft($("bloomboard").scrollLeft() + 10);
						}

						$("#top").on("click", topFn);
						$("#bottom").on("click", bottomFn);
						$("#left").on("click", leftFn);
						$("#right").on("click", rightFn);


						initToolbar();

						socket.on('connect', function() {
						});

						socket.emit('joinBoard', boardID);
						

						var penID;

						socket.on('penID', function(uPenID) {
							penID = uPenID;
						});

						socket.on('concurrent_users', function(data) {
							sketchpad.add_current_users(data.con_pens);
						});

						socket.on('clearBoard', function(data) {
							sketchpad.clear();
						});
						var pen = sketchpad.pen();
						socket.emit('s_new_con_user', {
							'pen': {"color": pen.color(), "width": pen.width()}
						});

						socket.on('con_mouse_down', function(data) {
							sketchpad.con_mouse_down(data.e, data.id);
						});

						socket.on('con_mouse_move', function(data) {
							sketchpad.con_mouse_move(data, data.id);
						});

						socket.on('con_mouse_up', function(data) {
							sketchpad.con_mouse_up(data, data.id);
						});

						socket.on('con_pen_color_change', function(data) {
							sketchpad.con_pen_change(data.color, data.id);
						});


						socket.on('new_con_user', function(data) {
							sketchpad.new_concurrent_user(data.pen, data.id);
						});

						socket.on('activate_board', function () {
							activate();
						});

						socket.on('lock_board', function () {
							deactivate();
						});

						scope.$watch(function() { return drawService.pencolor;}, function(pencolor) {
							var currentPen = sketchpad.pen();
							currentPen.color(pencolor);
							if (typeof penID !== "undefined") {
								socket.emit('s_con_pen_color_change', {id: penID, color: pencolor});
							}
						});

						socket.on('deleted', function () {
							$location.path('/boards');
						});

						socket.on('board_deleted', function () {
							$location.path('/boards');
						});

						

						scope.$watch(function() {
							return boardService.canEdit;
						}, function (canEdit) {
							if (canEdit) {
								activate();
							} else {
								sketchpad.editing(false);
							}
						});						
					});



					scope.$parent.leaveBoard.push(function () {
						socket.removeAllListeners('connect');
						socket.removeAllListeners('penID');
						socket.removeAllListeners('concurrent_users');
						socket.removeAllListeners('clearBoard');
						socket.removeAllListeners('con_mouse_down');
						socket.removeAllListeners('con_mouse_move');
						socket.removeAllListeners('con_mouse_up');
						socket.removeAllListeners('con_pen_color_change');
						socket.removeAllListeners('new_con_user');
						socket.removeAllListeners('activate_board');
						socket.removeAllListeners('lock_board');
						socket.removeAllListeners('deleted');
						socket.removeAllListeners('board_deleted');
						socket.emit('leaveBoard');
					});
				};

				if (sessionService.activeSession) {
     			load();
     		}
			}
		}
	}
});
