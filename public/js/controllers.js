'use strict';

/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $http) {


  }).
  controller('BoardCtrl', function ($scope, persistenceService) {

    $scope.boardText = "this is a board";

    var board = Raphael.sketchpad("drawingBoard", {
        width: 480,
        height: 320,
        input: "#boardData"
      });

    board.change(function() {
      $("#boardData").val(board.json());
    });

  }).controller('BoardHeaderCtrl', function ($scope, $http, $location) {

      $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {

  }).controller('LoginCtrl', function ($scope, $http, $location){
    
    $scope.loginData = function() {
      $http.post('/api/login', $scope.login).
        success(function (data) {
          $location.path('/home');
        });
    };

    $scope.createUser = function() {
      if ($scope.create.user.hasOwnProperty('displayName')) {
        if ($scope.create.user.displayName.length === 0){
          delete $scope.create.user.displayName;
        }
      }
      $http.post('/api/createUser', $scope.create).
        success(function (data) {
          //$location.path('/home');
        });
    };
    $scope.showLogin = false;
    $scope.showSignUp = false;
  });
