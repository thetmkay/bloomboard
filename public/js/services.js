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
			$(toolButton.id).on("mousedown", function() {
				$(".toolButtonActive").removeClass("toolButtonActive");

				$(toolButton.id).addClass("toolButtonActive");
				toolButton.press();
			});
			if(toolButton.noSelect)
			{
				$(toolButton.id).on("mouseup", function() {
					$(toolButton.id).removeClass("toolButtonActive");
				});
			}
		}

	}

	self.toolbar = toolbar;
});

appServicesModule.service('persistenceService', function($http, $q, $timeout) {
	
	// this.saveBoard = function(boardName, boardData, callback) {
	// 	$http.put('/api/board', {
	// 		boardName: boardName,
	// 		boardData: boardData
	// 	}).
	// 	success(function(data, status, headers, config) {
	// 		console.log(data);
	// 		callback(data, data);
	// 	}).
	// 	error(function(data, status, headers, config) {
	// 		callback(data, data);
	// 	});
	// };

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

	this.getBoardData = function(boardID) {
		var deferred = $q.defer();

		$timeout(function() {
			deferred.resolve($http.post('/api/board', {
				boardID: boardID
			}));
		}, 10000);

		return deferred.promise;
	};


	// var boardData = {
	// 	async: function() {
	// 		var promise = $http.get('/api/board').then(function(response) {
	// 			console.log(JSON.stringify(response.data, null, 4));
	// 			return response.data;
	// 		});

	// 		return promise;
	// 	}
	// };
	// this.boardData = boardData;

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

	self.displayName = null;

	self.activeSession = false;

	self.requestSuccess = 'loading';

	self.email = null;

	self.setActiveSession = function (value) {
	    self.activeSession = value;
	};

  self.getDisplayName = function () {
  	console.log("get display name");
  	$http.get('/api/getDisplayName').
      success(function (data) {
        self.displayName = data.displayName;
        self.activeSession = true;
      }).
      error(function (data, status){
        if (status === 401) {
          self.displayName = null;
          self.activeSession = false;
        }
      });
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
          console.log("successfully logged out")
          self.setActiveSession(false);
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

appServicesModule.service('boardService', function ($http) {

	//avoid confusion about this
	var self = this;

	self._id = null;
	self.name = null;
	self.write = null;
	self.read = null;
	self.board = null;
	self.leaveBoard = null;

	self.getBoardInformation = function (boardID, callback) {
		$http.post('/api/fetchBoard', {boardID: boardID}).
			success(function (data) {
				self.setBoard(data.boardAccess);
				callback(true);
			}).
			error(function (data) {
				callback(false);
			});
	};

	self.setBoard = function (value) {
			console.log('###' + JSON.stringify(value, null, 4));
			self._id = value._id;
	    self.name = value.name;
	    self.write = value.write;
	    self.read = value.read;
	};

	self.setBoardID = function () {
		self._id = null;
		self.name = null;
		self.write = null;
		self.read = null;
		self.board = null;
		self.leaveBoard = null;
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
