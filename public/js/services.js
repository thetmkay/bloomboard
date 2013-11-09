'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('persistenceService', function($http, $q, $timeout) {
	
	this.saveBoard = function(boardName, boardData, callback) {
		$http.put('/api/board', {
			boardName: boardName,
			boardData: boardData
		}).
		success(function(data, status, headers, config) {
			console.log(data);
			callback(data, data);
		}).
		error(function(data, status, headers, config) {
			callback(data, data);
		});
	}

	this.getBoardData = function() {
		var deferred = $q.defer();

		$timeout(function() {
			deferred.resolve($http.get('/api/board'));
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

appServicesModule.service('sessionService', function ($http) {

	//avoid confusion about this
	var self = this;

	self.displayName = null;

	self.activeSession = false;

	self.requestSuccess = 'loading';

	self.setActiveSession = function (value) {
	    self.activeSession = value;
	};

    self.getDisplayName = function () {
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

  	self.login = function(loginData, showFailMessage) {
  		$http.post('/api/login', loginData).
		        success(function (data) {
		          self.setActiveSession(true);
		          self.getDisplayName();
		        }).
		        error(function (data, status) {
		          if (status === 401) {
		            console.log('Doesnt exist');
		            showFailMessage("Could not authenticate username/password combination")
		          }
		        });
  	};

  	self.register = function(newUser, showFailMessage) {

  		//need to fix for real client side validation
  		try{
  			if(!newUser.user.hasOwnProperty('displayName') 
		      	|| newUser.user.displayName.length === 0)
		      {
		        newUser.user.displayName = 'anonymous';
		      }		
  		} catch(e)
  		{
  			showFailMessage("Please use a valid email address");
  			return;
  		}
      
      $http.post('/api/createUser', newUser).
        success(function (data) {
          self.setActiveSession(true);
          self.getDisplayName();
        }).
        error(function (data, status) {
          if (status === 401) {
            console.log('User exists');
            showFailMessage("This email has already been registered. Please use a different one.");
          }
        });
    };

    self.logout = function() {
    	$http.get('/api/logout').
          success(function (data) {
            self.setActiveSession(false);
          });
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
