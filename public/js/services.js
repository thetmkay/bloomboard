'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
  value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('persistenceService', function($http) {
	
	this.saveBoard = function(boardData) {
		$http.put('/api/board', {
			boardData: boardData
		});
	}

	//this.getBoard = function(boardName) {
		var boardData = {
			async: function() {
				var promise = $http.get('/api/board').then(function(response) {
					console.log("service response: ", response);
					return response.data;
				});

				return promise;
			}
		};
		this.boardData = boardData;
	//}

})