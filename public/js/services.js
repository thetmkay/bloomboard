'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bloomboard.services', []).
  value('version', '0.1');

var appServicesModule = angular.module('bloomboard.services', []);

appServicesModule.service('persistenceService', function($http, $state, $stateParams) {
	
	this.saveBoard = function(boardData) {
		$http.put('/api/board', {
			boardData: boardData
		});
	}

})