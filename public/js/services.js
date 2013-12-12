'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('drawService', function () {
	var self = this;

	var toolbar = {
			draw:{},
			select:{},
			clear:{noSelect: true},
			save:{noSelect:true}
		};


	self.bind = function(toolButton) {
		if(toolButton && toolButton.id && toolButton.press)
		{
			var downFn = function() {
				$(".toolButtonActive").removeClass("toolButtonActive");

				$(toolButton.id).addClass("toolButtonActive");
				toolButton.press();
			};

			$(toolButton.id).on("mousedown", downFn);
			$(toolButton.id).on("touchstart", downFn);
			if(toolButton.noSelect)
			{
				var upFn = function() {
					$(toolButton.id).removeClass("toolButtonActive");
				};	
				$(toolButton.id).on("mouseup", upFn);
				$(toolButton.id).on("mouseleave", upFn);
				$(toolButton.id).on("touchend", upFn);
				$(toolButton.id).on("touchcancel", upFn);
			}
		}

	}

	self.toolbar = toolbar;
});

appServicesModule.service('persistenceService', function($http, $timeout, $location, boardService) {

	this.clearBoard = function(boardID, callback) {
		$http.put('/api/clearBoard', {
			boardID: boardID
		}).success(function(data, status, headers, config) {
			console.log(data);
			callback(data, data);
		}).
		error(function(data, status, headers, config) {
			callback(data, data);
		});
	};

	this.getBoardData = function(boardID, callback) {
		$http.post('/api/board', {
			boardID: boardID
		}).success(function(data) {
			console.log(JSON.stringify(data, null, 4));
			boardService.setBoard(data, function () {
				callback(data);
			});
		}).
		error(function (data, status) {
			if (status === 401) {
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

appServicesModule.service('sessionService', function ($http, $q, $timeout) {

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
  	console.log("get display name");
  	$http.get('/api/getDisplayName').
      success(function (data) {
      	console.log(JSON.stringify(data, null, 4));
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
        console.log("successfully logged out");
        self.reset();
      });
  };

	self.login = function(loginData, showFailMessage) {
		$http.post('/api/login', loginData).
      success(function (data) {
      	loginData.email = '';
      	loginData.password = '';
        self.setActiveSession(true);
        self.getDisplayName();
        self.email = self.getEmail();
        showFailMessage(null);
      }).
      error(function (data, status) {
        if (status === 401) {
        	loginData.password = '';
          console.log('Doesnt exist');
          showFailMessage("Could not authenticate username/password combination")
        }
      });
	};

	self.register = function(newUser, showFailMessage) {

		//need to fix for real client side validation
		try{
/*
			if(!newUser.user.email.match("[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@" +
				"(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")) {
				showFailMessage("Please enter a valid email address");
				return;
			}

			if(newUser.password === undefined) {
				showFailMessage("Please enter a password");
				return;
			} else if(newUser.password.length < 5) {
				showFailMessage("Please enter a password at least 5 characters long");
				return;
			}
*/
			if(!newUser.user.hasOwnProperty('displayName') 
	      	|| newUser.user.displayName.length === 0)
	      {
	        newUser.user.displayName = 'anonymous';
	      }		
		} catch(e)
		{
			showFailMessage("Please enter a valid email address");
			return;
		}
    
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
          console.log('User exists');
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

	self.getBoardInformation = function (boardID, callback) {
		$http.post('/api/fetchBoard', {boardID: boardID}).
			success(function (data) {
				console.log(JSON.stringify(data, null, 4));
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
	    var userid = sessionService._id;
	    for (var i = 0; i < self.writeAccess.length; i++) {
	    	console.log(JSON.stringify(self.writeAccess[i], null, 4));
	    	if (self.writeAccess[i]._id === userid) {
	    		self.canEdit = true;
	    		break;
	    	}
	    }
	    if (callback) {
	    	callback(true);
	    }
	};

	self.setLeaveBoard = function (value) {
		self.leaveBoard = value;
	};

});

/*appServicesModule.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apple(function () {
					callback.apply(socket, args);
				})
			});
		}
	}
});*/
