'use strict';

// Declare app level module which depends on filters, and services

angular.module('bloomboard', [
  'bloomboard.controllers',
  'bloomboard.filters',
  'bloomboard.services',
  'bloomboard.directives'
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
