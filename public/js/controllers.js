'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location) {
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

    $scope.clearBoard = function() {
        persistenceService.clearBoard("testBoard2", function(data, info) {
            console.log("board cleared");
        });
    };


  }).controller('BoardHeaderCtrl', function ($scope, $http, $location, sessionService) {
      
      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});

      $scope.clickLogout = function () {
        sessionService.logout();
      }

      console.log($scope);
      $scope.clickLogin = function() {
        //double check
        if(!sessionService.activeSession)
        {
          $("#loginModal").modal('show');
        }
      }

  }).controller('HomeCtrl', function ($scope) {
  
  }).controller('ListCtrl', function ($scope) {

  });
