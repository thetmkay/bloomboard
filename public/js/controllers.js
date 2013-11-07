'use strict';

/* Controllers */

angular.module('bloomboard.controllers', ['ngCookies']).
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

  }).controller('BoardHeaderCtrl', function ($scope, $http, $location, $cookies) {
      $scope.activeSession = false;
      
      $scope.$on('login', function() {
        if ($cookies.hasOwnProperty('userData')) {
          $scope.activeSession = true;
        } else {
          $scope.activeSession = false;
        }
      });

      $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {

  }).controller('LoginCtrl', function ($scope, $http, $location, $cookies){
    
    $scope.loginData = function() {
      $http.post('/api/login', $scope.login).
        success(function (data) {
          console.log(JSON.stringify(data, null, 4));
          $location.path('/home');
        }).
        error(function (data, status) {
          if (status === 404) {
            console.log('Doesnt exist');
          }
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
          console.log(JSON.stringify(data, null, 4));

          $location.path('/home');
        }).
        error(function (data, status) {
          if (status === 404) {
            console.log('User exists');
          }
        });
    };
    $scope.showLogin = false;
    $scope.showSignUp = false;
  });
