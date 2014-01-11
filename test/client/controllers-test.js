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
	it('should have a BoardCtrl', function() {
		expect(scope).not.toBeNull();
		state.ensureAllTransitionsHappened();
	});

	it('should have variable text = "this is a board"', function() {
		expect(scope.boardText).toBe('this is a board');
		// expect(false).toBeTruthy();
		state.ensureAllTransitionsHappened();
	});

});

describe('CreateBoardCtrl', function () {
	var scope, location, ctrl, httpBackend, state;

	//mock Application to allow us to inject our own dependencies
	beforeEach(angular.mock.module('bloomboard'));
	beforeEach(angular.mock.module('stateMock'));

	beforeEach(angular.mock.inject(function ($rootScope, $httpBackend, $location, $controller, $state) {
		location = $location;
		scope = $rootScope.$new();
		ctrl = $controller('CreateBoardCtrl', {$scope: scope});
		httpBackend = $httpBackend;
		state = $state;
	}));

	it('should redirect to "/boards"', function () {
		// httpBackend.flush();
		httpBackend.expectPOST('/api/createBoard', {newBoardName: 'Valid Name'}).respond(200);
		var boardName = 'Valid Name'
		scope.boardData = {};
		scope.boardData.newBoardName = 'Valid Name';
		scope.createBoardClick();
		//simulate server response
		httpBackend.flush();
		expect(location.path()).toBe('/boards');
		expect(scope.boardData.newBoardName).toBeUndefined();
		state.ensureAllTransitionsHappened();	
	});
});

describe('ShowBoardsCtrl', function () {
	var scope, location, ctrl, httpBackend, state, sessionServiceMock, boardServiceMock;

	//mock Application to allow us to inject our own dependencies
	beforeEach(angular.mock.module('bloomboard'));
	beforeEach(angular.mock.module('stateMock'));

	beforeEach(angular.mock.inject(function ($rootScope, $httpBackend, $location, $controller, $state) {
		location = $location;
		location.path('/boards');
		scope = $rootScope.$new();
		
		sessionServiceMock = {
			activeSession: false,
			reset: function () {
				this.activeSession = false;
			}
		};

		boardServiceMock = {
			getBoardInformation: function (boardDetails, callback) {
				callback(boardDetails.boardID === 1);
			}
		};

		spyOn(sessionServiceMock, 'reset');
		ctrl = $controller('ShowBoardsCtrl', {
			$scope: scope, 
			sessionService: sessionServiceMock, 
			boardService: boardServiceMock
		});
		//register change for watch variables in scope
		scope.$digest();
		httpBackend = $httpBackend;
		state = $state;
	}));

	it('should have default values set on controller load', function () {
		expect(scope.boards).toEqual([]);
		expect(scope.showRead).toBeFalsy();
		expect(scope.showWrite).toBeFalsy();
	});

	it('should trigger http call on change of activeSession to true', function () {
		//state.ensureAllTransitionsHappened();
		// sessionServiceMock.activeSession = true;
		// scope.$digest();
		httpBackend.expectGET('/api/boards').respond(200, {boards: {
			write: [{_id: '1'}],
			read: []
		}});

		sessionServiceMock.activeSession = true;
		//register change for watch variables in scope
		scope.$digest();
		//simulate server response
		httpBackend.flush();
		expect(sessionServiceMock.reset).not.toHaveBeenCalled();
		expect(scope.boards.write).toEqual([{_id: '1', writeAccess: true}]);
		expect(scope.boards.read).toEqual([]);
		expect(scope.showRead).toBeFalsy();
		expect(scope.showWrite).toBeTruthy();
	});

	it('should reset sessionService if not authenticated at server', function () {
		httpBackend.expectGET('/api/boards').respond(401);
		sessionServiceMock.activeSession = true;
		//register change for watch variables in scope
		scope.$digest();
		//simulate server response
		httpBackend.flush();
		expect(sessionServiceMock.reset).toHaveBeenCalled();
	});

	it('should change location on view board call', function () {
		scope.viewBoard('1', 'name');
		expect(location.path()).toBe('/board/1/name');
	});

	it('should change location on successful board retrieval', function () {
		scope.editClick(1);
		expect(location.path()).toBe('/editBoard');
	});

	it("shouldn't change location on failed board retrieval", function () {
		scope.editClick(2);
		expect(location.path()).toBe('/boards');
	});
});

describe('NewUserCtrl', function () {
	var scope, location, ctrl, httpBackend, state, sessionServiceMock;

	beforeEach(angular.mock.module('bloomboard'));
	beforeEach(angular.mock.module('stateMock'));

	beforeEach(angular.mock.inject(function ($rootScope, $httpBackend, $location, $controller, $state) {
		location = $location;
		location.path('/newUser');
		scope = $rootScope.$new();
		
		sessionServiceMock = {
		};

		ctrl = $controller('NewUserCtrl', {
			$scope: scope, 
			sessionService: sessionServiceMock
		});
		httpBackend = $httpBackend;
		state = $state;
	}));

	it('should set "needsEmail" depending on sessionService.email', function () {
		sessionServiceMock.email = null;
		scope.$digest();
		expect(scope.needsEmail).toBeTruthy();
		sessionServiceMock.email = 'test@test.com';
		scope.$digest();
		expect(scope.needsEmail).toBeFalsy();
	});

	it('should change location on successful username (and email addition)', function () {
		httpBackend.expectPOST('/api/setUsername', {username: 'name'}).respond(200);
		scope.user = {username: 'name'};
		scope.newDetails();
		httpBackend.flush();
		expect(location.path()).toBe('/boards');
	});

	it('should not change location on unsuccessful username (and email addition)', function () {
		httpBackend.expectPOST('/api/setUsername', {username: 'name'}).respond(401);
		scope.user = {username: 'name'};
		scope.newDetails();
		httpBackend.flush();
		expect(location.path()).toBe('/newUser');
	});
});

