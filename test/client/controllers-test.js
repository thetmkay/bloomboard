describe('BoardCtrl', function() {
	var scope; //we'll use this scope in our tests
	var state;

	//mock Application to allow us to inject our own dependencies
	beforeEach(angular.mock.module('bloomboard'));
	beforeEach(angular.mock.module('stateMock'));

	beforeEach(angular.mock.inject(function($httpBackend) {
		$httpBackend.expectGET('/api/board').respond([]);
	}));

	//mock the controller for the same reason and include $rootScope and $controller
	beforeEach(angular.mock.inject(function($rootScope, $controller, $state, $httpBackend) {
		//create an empty scope
		scope = $rootScope.$new();
		state = $state;
		//declare the controller and inject our empty scope
		$controller('BoardCtrl', {
			$scope: scope
		});


	}));

	// tests start here
	it('should have variable text = "this is a board"', function() {
		expect(scope.boardText).toBe('this is a board');
		state.ensureAllTransitionsHappened();
	});

});