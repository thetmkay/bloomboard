'use strict';

// Declare app level module which depends on filters, and services

angular.module('bloomboard', [
  'bloomboard.controllers',
  'bloomboard.filters',
  'bloomboard.services',
  'bloomboard.directives',
  'ui.router'
]).
config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/board');

  $stateProvider.
    state('board', {
      url: '/board',
      views: {
        'mainView' : {
          templateUrl: 'partials/board',
          controller: 'BoardCtrl'
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
      }
    });

  $locationProvider.html5Mode(true);
}]);
