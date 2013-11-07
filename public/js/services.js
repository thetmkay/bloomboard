'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('persistenceService', function($http) {
	
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