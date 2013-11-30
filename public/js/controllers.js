'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location, sessionService) {
    $(document).foundation();
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

      $(document).foundation('topbar', {
        is_hover: false,
        mobile_show_parent_link: true
      });

      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});


      ///refactor this shit
      $scope.clickLogout = function () {
        sessionService.logout();
      };
      $("#logoutButton").on("click", function(e){$scope.clickLogout();});
      
      $scope.clickLogin = function() {
        //double check
        if(!sessionService.activeSession)
        {
          $("#loginModal").foundation('reveal','open');
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
          $scope.showWrite = data.boards.write.length > 0;
          $scope.showRead = data.boards.read.length > 0;
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
