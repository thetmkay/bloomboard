'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.factory('drawService', function () {
	var self = {};

	self.textInput = "";
	// var toolWidth = 50;
	self.pencolor="#000000";
	self.pc = "#000000";

	//replace scope.watches that are not working
	self.changeColor;
	self.changeWidth;
	self.changeMode;

	var toolbar = {};
	toolbar.id = "#drawingToolBar";
	// toolbar.toolsId = "#toolsSection";
	// toolbar.dropdown = {};
	// toolbar.dropdown.id = "#toolsMenu";
	// toolbar.dropdown.num = 0;
	toolbar.tools = {
			draw:{modal:true, mode:1},
			erase:{modal:true, mode:0},
			text:{modal:true, mode: 1},
			select:{modal:true, mode: 2},
			clear:{modal:false},
			save:{modal:false},
			pan:{modal:true, mode: 0},
			'delete':{modal:false}
		};

	toolbar.modeid = "#modeMenuButton > i";
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

	toolbar.mode = 1;

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
						toolbar.mode = toolButton.mode;
						//self.changeMode(toolbar.mode);
					}

					console.log(toolbar.mode);
						
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

	return self;
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
	self.notify = true;

	self.setActiveSession = function (value) {
	    self.activeSession = value;
	};

  self.getDisplayName = function () {
  	$http.get('/api/getDisplayName').
      success(function (data) {
      	self._id = data._id;
        self.displayName = data.displayName;
        self.notify = data.notify;
        if (data.email) {
        	self.email = data.email;
        }
        if (data.username) {
        	self.username = data.username;
        	self.activeSession = true;
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

	self._id;
	self.name;
	self.canEdit;
	self._public;
	self.creation;

	self.reset = function () {
		self._id = null;
		self.name = null;
		self.canEdit = false;
		self._public = false;
		self.creation = 0;
	};

	self.reset();

	self.setBoard = function (value, callback) {
		self._id = value._id;
	    self.name = value.name;
	    self.canEdit = value.canEdit;
	    self._public = value._public;
	    self.creation = value.creation;
	    if (callback) {
	    	callback(true, value);
	    }
	};
});
