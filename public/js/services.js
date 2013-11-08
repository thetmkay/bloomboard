'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('persistenceService', function($http) {
	
	this.saveBoard = function(boardData) {
		console.log(JSON.stringify(boardData));
		$http.put('/api/board', {
			boardData: boardData
		});
	}

	var boardData = {
		async: function() {
			var promise = $http.get('/api/board').then(function(response) {
				return response.data;
			});

			return promise;
		}
	};
	this.boardData = boardData;

});

appServicesModule.service('sessionService', function ($http) {

	//avoid confusion about this
	var self = this;

	self.displayName = null;

	self.activeSession = false;



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

  	self.login = function(loginData) {
  		$http.post('/api/login', loginData).
		        success(function (data) {
		          self.setActiveSession(true);
		          self.getDisplayName();
		        }).
		        error(function (data, status) {
		          if (status === 401) {
		            console.log('Doesnt exist');
		          }
		        });
  	};

  	self.register = function(newUser) {
      if (!newUser.user.hasOwnProperty('displayName') || newUser.user.displayName.length === 0)
      {
        newUser.user.displayName = 'anonymous';
      }
      $http.post('/api/createUser', newUser).
        success(function (data) {
          self.setActiveSession(true);
          self.getDisplayName();
        }).
        error(function (data, status) {
          if (status === 401) {
            console.log('User exists');
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