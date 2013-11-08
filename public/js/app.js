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
  'fitText',
  'btford.socket-io'
]).
config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, socket) {
  $urlRouterProvider.otherwise('/board');

  $stateProvider.
    state('board', {
      url: '/board',
      views: {
        'mainView' : {
          templateUrl: 'partials/board',
          controller: 'BoardCtrl'
        },
        'mainHeader' : {
          templateUrl: 'partials/homeheader',
          controller: 'BoardHeaderCtrl'
        },
      }
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
        },
        'mainHeader' : {
          templateUrl: 'partials/homeheader',
          controller: 'BoardHeaderCtrl'
        },
      }
    }).
    state('profile', {
      url: '/profile',
      views: {
        'mainView' : {
          templateUrl: 'partials/login',
          controller: 'HomeCtrl'
        },
        'mainHeader' : {
          templateUrl: 'partials/homeheader',
          controller: 'BoardHeaderCtrl'
        },
      }
    });

  $locationProvider.html5Mode(true);
}]);
