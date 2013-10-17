'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/board', {
      templateUrl: 'partials/board',
      controller: 'BoardCtrl'
    }).
    otherwise({
      redirectTo: '/board'
    });

  $locationProvider.html5Mode(true);
});
