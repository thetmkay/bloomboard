'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('drawService', function () {
	var self = this;

	// var toolWidth = 50;
	self.pencolor="#000";

	var toolbar = {};
	toolbar.id = "#drawingToolBar";
	// toolbar.toolsId = "#toolsSection";
	// toolbar.dropdown = {};
	// toolbar.dropdown.id = "#toolsMenu";
	// toolbar.dropdown.num = 0;
	toolbar.tools = {
			draw:{modal:true},
			select:{modal:true},
			clear:{modal:false},
			save:{modal:false},
			pan:{modal:true}
		};

	toolbar.modeid = "#modeToolButton > i";
	toolbar.modeclass = "";

	// var toggle = function() {
	// 	console.log("rezising");
	// 	console.log(toolbar.dropdown.num);
	// 	var marginError = 10;
	// 	var bar = $(toolbar.id);
	// 	// console.log(window);
	// 	var totalWidth = 0;
	// 	bar.find("> ul > li").each(function() { 
	// 		totalWidth += $(this).outerWidth();
	// 	});
	// 	console.log("wind " + window.innerWidth + " bar " + totalWidth);
	// 	if(totalWidth + marginError > window.innerWidth) {
	// 		//console.log($(toolbar.toolsId + "> li:last-child"));
	// 		var toolElem = bar.find(toolbar.toolsId + "> li.fold").last().detach();
	// 		console.log("shrinking" + toolWidth);
	// 		bar.find(toolbar.dropdown.id + " > ul").prepend(toolElem);
	// 		totalWidth -= toolWidth;
	// 		if(toolbar.dropdown.num == 0)
	// 		{
	// 			//add new button
	// 		}
	// 		toolbar.dropdown.num += 1;
	// 	}
	// 	var topElemSelector = toolbar.dropdown.id + "> ul > li";
	// 	var topElem = bar.find(topElemSelector).first();
	// 	console.log(topElem);
	// 	while(toolbar.dropdown.num > 0 && (toolWidth + totalWidth + marginError < window.innerWidth))
	// 	{
	// 		topElem.detach();
	// 		console.log("expanding" + topElem.outerWidth());
	// 		bar.find(toolbar.dropdown.id).before(topElem);
	// 		totalWidth += toolWidth;
	// 		toolbar.dropdown.num -= 1;
	// 		topElem = bar.find(topElemSelector).first();
	// 	}
	// }

	// $(window).resize(toggle);

	self.bind = function(toolButton) {
			if(toolButton && toolButton.id && toolButton.press)
			{
				var downFn = function() {
					
					if(toolButton.modal) {
						$(toolButton.id).siblings().removeClass("toolButtonActive");
						$(toolButton.id).addClass("toolButtonActive");
						$(toolbar.modeid).removeClass(toolbar.modeclass);
						$(toolbar.modeid).addClass(toolButton.icon);
						toolbar.modeclass = toolButton.icon;
					}
						
					toolButton.press();
				};

				$(toolButton.id).on("mousedown", downFn);
				$(toolButton.id).on("touchstart", downFn);
				// if(toolButton.noSelect)
				// {
				// 	var upFn = function() {
				// 		$(toolButton.id).removeClass("toolButtonActive");
				// 	};	
				// 	$(toolButton.id).on("mouseup", upFn);
				// 	$(toolButton.id).on("mouseleave", upFn);
				// 	$(toolButton.id).on("touchend", upFn);
				// 	$(toolButton.id).on("touchcancel", upFn);
				// }
			}
		}

	

	self.toolbar = toolbar;
});

appServicesModule.service('persistenceService', function($http, $timeout, $location, boardService) {

	this.clearBoard = function(boardID, callback) {
		$http.put('/api/clearBoard', {
			boardID: boardID
		}).success(function(data, status, headers, config) {
			callback(data, data);
		}).
		error(function(data, status, headers, config) {
			callback(data, data);
		});
	};

	this.getBoardData = function(boardID, callback) {
		boardService.getBoardInformation({
			boardID: boardID,
			data: true
		}, function (success, data){
			if (success) {
				callback(data);
			} else {
				$location.path('/boards');
			}
		});
	};

});

// appServicesModule.service('exportService', function ($http) {

// 	this.svg_png = function(svgData, callback) {
// 		$http.put('/api/svg_png', svgData).
// 		success(function(data, status, headers, config) {
// 			console.log("png image data: " + data);
// 			callback(data, data);
// 		}).
// 		error(function(data, status, headers, config) {
// 			console.log("FAILED png image data: " + data);
// 			callback(data, data);
// 		});
// 	};
// });

appServicesModule.service('sessionService', function ($http, $location, $q, $timeout) {

	//avoid confusion about this
	var self = this;
	self._id = null;
	self.displayName = null;
	self.activeSession = false;
	self.requestSuccess = 'loading';
	self.email = null;
	self.username = null;

	self.setActiveSession = function (value) {
	    self.activeSession = value;
	};

  self.getDisplayName = function () {
  	$http.get('/api/getDisplayName').
      success(function (data) {
      	self._id = data._id;
        self.displayName = data.displayName;
        self.activeSession = true;
        if (data.email) {
        	self.email = data.email;
        }
        if (data.username) {
        	self.username = data.username;
        }
      }).
      error(function (data, status){
        if (status === 401) {
        	$location.path("/home");
        	self.reset();
        }
      });
	};

	self.reset = function () {
		self._id = null;
		self.displayName = null;
		self.activeSession = false;
		self.email = null;
		self.username = null;
	};

	self.getEmail = function() {
		var deferred = $q.defer();

		$timeout(function() {
			deferred.resolve($http.get('/api/email'));
		}, 10000);

		return deferred.promise.email;
	};

  self.logout = function() {
  	$http.get('/api/logout').
      success(function (data) {
        self.reset();
      });
  };

	self.register = function(newUser, showFailMessage) {

    
    $http.post('/api/createUser', newUser).
      success(function (data) {
      	showFailMessage(null);
      	newUser.user.email = '';
      	newUser.user.displayName = '';
      	newUser.password = '';
        self.setActiveSession(true);
        self.getDisplayName();
      }).
      error(function (data, status) {
      	newUser.user.email = '';
      	newUser.user.displayName = '';
      	newUser.password = '';
        if (status === 401) {
          showFailMessage("This email has already been registered. Please use a different one.");
        }
      });
  };   
});

appServicesModule.service('boardService', function ($http, sessionService) {

	//avoid confusion about this
	var self = this;

	self._id = null;
	self.name = null;
	self.writeAccess = [];
	self.readAccess = [];
	self.board = null;
	self.leaveBoard = null;
	self.canEdit = false;

	self.getBoardInformation = function (reqData, callback) {
		$http.post('/api/fetchBoard', reqData).
			success(function (data) {
				self.setBoard(data.boardAccess, callback);
			}).
			error(function (data) {
				if (callback) {
					callback(false);
				}
			});
	};

	self.setBoard = function (value, callback) {
			self.canEdit = false;
			self._id = value._id;
	    self.name = value.name;
	    self.writeAccess = value.writeAccess;
	    self.readAccess = value.readAccess;
	    self.canEdit = value.canEdit;
	    if (callback) {
	    	callback(true, value);
	    }
	};

	self.setName = function (name) {
		self.name = name;
	};

	self.setLeaveBoard = function (value) {
		self.leaveBoard = value;
	};

	self.duplicateBoard = function() {
		http.post('/api/duplicateBoard');
	}

});
