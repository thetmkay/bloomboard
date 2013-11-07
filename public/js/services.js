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

})