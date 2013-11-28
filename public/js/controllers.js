'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location, sessionService) {
    sessionService.getDisplayName();
    $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };
  }).
  controller('BoardCtrl', function ($scope, $location, persistenceService) {
    
    $("#boardData").val(persistenceService.board);
    $scope.boardText = "this is a board";

    // var board = Raphael.sketchpad("drawingBoard", {
    //     width: 480,
    //     height: 320,
    //     input: "#boardData"
    //   });

    // board.change(function() {
    //   $("#boardData").val(board.json());
    // });
    

    $scope.isSelectMode = false;
     
    $scope.toggleSelectMode = function() {
      $scope.isSelectMode = !$scope.isSelectMode;
    }

    


  }).controller('BoardHeaderCtrl', function ($scope, $http, $location, sessionService) {
      
      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});

      $scope.clickLogout = function () {
        sessionService.logout();
      };

      console.log($scope);
      $scope.clickLogin = function() {
        //double check
        if(!sessionService.activeSession)
        {
          $("#loginModal").modal('show');
        }
      };

      $scope.clickCreateBoard = function() {
        //double check
          $location.path('/createBoard');
      };

      $scope.clickBoards = function() {
        //double check
          $location.path('/boards');
      };

  }).controller('HomeCtrl', function ($scope) {
  
  }).controller('ListCtrl', function ($scope) {

  }).controller('CreateBoardCtrl', function ($scope, $http) {
    
    $scope.createBoardClick = function () {
      $http.post('/api/createBoard', $scope.boardData).
        success(function (data, status) {
          console.log(JSON.stringify(data, null, 4));
        });
    }
  }).controller('ShowBoardsCtrl', function ($scope, $http) {

    $scope.boards = [];
    $http.get('/api/boards').
      success(function (data, status) {
        console.log();
        $scope.boards = data.boards;
      });

  });
