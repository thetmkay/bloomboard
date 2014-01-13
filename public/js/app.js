'use strict';

angular.module('stateMock',[]);
angular.module('stateMock').service("$state", function(){
    this.expectedTransitions = [];
    this.transitionTo = function(stateName){
        if(this.expectedTransitions.length > 0){
            var expectedState = this.expectedTransitions.shift();
            if(expectedState !== stateName){
                throw Error("Expected transition to state: " + expectedState + " but transitioned to " + stateName );
            }
        }else{
            throw Error("No more transitions were expected!");
        }
        console.log("Mock transition to: " + stateName);
    }
 
    this.expectTransitionTo = function(stateName){
        this.expectedTransitions.push(stateName);
    }
 
 
    this.ensureAllTransitionsHappened = function(){
        if(this.expectedTransitions.length > 0){
            throw Error("Not all transitions happened!");
        }
    }
});

// Declare app level module which depends on filters, and services

angular.module('bloomboard', [
  'bloomboard.controllers',
  'bloomboard.filters',
  'bloomboard.services',
  'bloomboard.directives',
  'ui.router',
  'btford.socket-io'
]).
config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/boards');

  $stateProvider.
    state('board', {
      url: '/board/:boardID/:boardName',
      views: {
        'mainView' : {
          templateUrl: 'partials/board',
          controller: 'BoardCtrl'
        }
      }
      // resolve: {
      //   boardService:'boardService'
      // },
      //onExit: leaveBoard()
    }).
    state('boardlist', {
      url: '/list',
      views: {
        'mainView' : {
          templateUrl: 'partials/boardlist',
          controller: 'ListCtrl'
        },
      }
    }).
    state('home', {
      url: '/home',
      views: {
        'mainView' : {
          templateUrl: 'partials/home',
          controller: 'HomeCtrl'
        }
      }
    }).
    state('profile', {
      url: '/profile',
      resolve: {
        sessionService: 'sessionService'
      },
      views: {
        'mainView' : {
          templateUrl: 'partials/login',
          controller: 'HomeCtrl'
        }
      }
    }).
    state('createBoard', {
      url: '/createBoard',
      views: {
        'mainView' : {
          templateUrl: 'partials/createBoard',
          controller: 'CreateBoardCtrl'
        }
      }
    }).
    state('userSettings', {
      url: '/userSettings',
      views: {
        'mainView' : {
          templateUrl: 'partials/userSettings',
          controller: 'CreateBoardCtrl'
        }
      }
    }).
    state('showBoards', {
      url: '/boards',
      resolve: {
        sessionService: 'sessionService'
      },
      views: {
        'mainView' : {
          templateUrl: 'partials/showBoards',
          controller: 'ShowBoardsCtrl'
        }
      }
    }).
    state('editBoard', {
      url: '/editBoard',
      views: {
        'mainView' : {
          templateUrl: 'partials/editBoard',
          controller: 'EditBoardCtrl'
        }
      }
    }).
    state('newUser', {
      url: '/newUser',
      views: {
        'mainView' : {
          templateUrl: 'partials/newUser',
          controller: 'NewUserCtrl'
        }
      }
    });

  $locationProvider.html5Mode(true);
}]);
