'use strict';

/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $http) {


  }).
  controller('BoardCtrl', function ($scope) {
    // write Ctrl here
    $scope.boardText = "this is a board";
  });
