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
      };
  }).controller('ShowBoardsCtrl', function ($scope, $http, $location, boardService) {

      $scope.boards = [];
      $http.get('/api/boards').
        success(function (data, status) {
          console.log();
          $scope.boards = data.boards;
        });

      $scope.editClick = function(boardID) {
        boardService.getBoardInformation(boardID, function (success) {
          if (success) {
            $location.path('/editBoard');
          }
        })
        
      };

  }).controller('EditBoardCtrl', function ($scope, $http, $location, boardService) {
      $scope.$watch(function() {return boardService.name;}, function(boardName) {$scope.boardName = boardName;});
      $scope.$watch(function() {return boardService.write;}, function(writeAccess) {$scope.writeAccess = writeAccess;});
      $scope.$watch(function() {return boardService.read;}, function(readAccess) {$scope.readAccess = readAccess;});

      $scope.addAccessClick = function () {
        var send = {
          boardID: boardService._id,
          emails: {
            writeAccess: [],
            readAccess: []
          }
        };
        if ($scope.hasOwnProperty('addWriteAccess')) {
          send.emails.writeAccess = $scope.addWriteAccess.split(/;| |,/).filter(function (email) {
            return email.length !== 0;
          });
        }
        if ($scope.hasOwnProperty('addReadAccess')) {
          send.emails.readAccess = $scope.addReadAccess.split(/;| |,/).filter(function (email) {
            return email.length !== 0;
          });
        }
        $http.post('/api/addUsersAccess', send).
          success(function (data) {
            $location.path('/boards');
          });
        //console.log(JSON.stringify(emails, null, 4));
      };
  });
