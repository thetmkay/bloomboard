'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location, sessionService) {
    $(document).foundation();
    sessionService.getDisplayName();
    $scope.$watch(function() {
      return sessionService.activeSession;
    },
    function(newVal) {
      $scope.showView = newVal;
    });

      
    

    $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };
  }).
  controller('BoardCtrl', function ($scope, $location, $stateParams, persistenceService, drawService) {
    console.log($stateParams.boardID);
    console.log($stateParams.boardName);

    $(document).foundation('tooltip', {disable_for_touch:true});
    
    $scope.boardID = $stateParams.boardID;
    $scope.boardName = $stateParams.boardName;
    $("#boardData").val(persistenceService.board);
    $scope.boardText = "this is a board";

    $scope.$on('$destroy', function() {
      if ($scope.leaveBoard) {
        console.log('leaving');
        $scope.leaveBoard();
      }
    });

    // var board = Raphael.sketchpad("drawingBoard", {
    //     width: 480,
    //     height: 320,
    //     input: "#boardData"
    //   });

    // board.change(function() {
    //   $("#boardData").val(board.json());
    // });
    



  }).controller('BoardHeaderCtrl', function ($scope, $http, $location, sessionService) {



      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});


      $(document).foundation('tooltip', {disable_for_touch:true});
      $(document).foundation('topbar', {
        is_hover: false,
        mobile_show_parent_link: true
      });
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

  }).controller('CreateBoardCtrl', function ($scope, $http, $location) {

      $scope.createBoardClick = function () {
        $http.post('/api/createBoard', $scope.boardData).
          success(function (data, status) {
            delete $scope.boardData.newBoardName;
            console.log(JSON.stringify(data, null, 4));

            $location.path('/boards');
          });
      };

  }).controller('ShowBoardsCtrl', function ($scope, $http, $location, boardService, sessionService) {

      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {
        if (!activeSession) {
          reset();
        } else {
          $http.get('/api/boards').
            success(function (data, status) {
              console.log();
              $scope.showWrite = data.boards.write.length > 0;
              $scope.showRead = data.boards.read.length > 0;
              $scope.boards = data.boards;
            }).
            error(function (data, status) {

            });
        }
      });

      var reset = function () {
        $scope.boards = [];
        $scope.showRead = false;
        $scope.showWrite = false;
      };      

      $scope.editClick = function(boardID) {
        boardService.getBoardInformation({
          boardID: boardID,
          data: false
        }, function (success) {
          if (success) {
            $location.path('/editBoard');
          }
        });
      };

      $scope.viewBoard = function(boardID, boardName) {
        //boardService.getBoardInformation(boardID);
        $location.path('/board/' + boardID + '/' + boardName);
        
      };

  }).controller('EditBoardCtrl', function ($scope, $http, $location, boardService) {
      $scope.$watch(function() {return boardService.name;}, function(boardName) {$scope.boardName = boardName;});
      $scope.$watch(function() {return boardService.writeAccess;}, function(writeAccess) {$scope.writeAccess = writeAccess;});
      $scope.$watch(function() {return boardService.readAccess;}, function(readAccess) {$scope.readAccess = readAccess;});
      $scope.$watch(function() {return boardService.canEdit;}, function(canEdit) {$scope.canEdit = canEdit;});

      $scope.addAccessClick = function () {
        var send = {
          boardID: boardService._id,
          usernames: {
            writeAccess: [],
            readAccess: []
          }
        };
        if ($scope.hasOwnProperty('addWriteAccess')) {
          send.usernames.writeAccess = $scope.addWriteAccess.split(/;| |,/).filter(function (username) {
            return username.length !== 0;
          });
        }
        if ($scope.hasOwnProperty('addReadAccess')) {
          send.usernames.readAccess = $scope.addReadAccess.split(/;| |,/).filter(function (username) {
            return username.length !== 0;
          });

        }
        delete $scope.addWriteAccess;
        delete $scope.addReadAccess;
        $http.post('/api/addUsersAccess', send).
          success(function (data) {
            boardService.getBoardInformation({boardID: boardService._id, data: false}, function () {});
          });
      };


      $scope.deleteBoard = function () {
        console.log(boardService._id);
        $http.post('/api/deleteBoard', {boardID: boardService._id}).
          success(function (data, status) {
            $location.path('/boards');
          });
      };
  }).controller('NewUserCtrl', function ($scope, $http, $location, sessionService) {
    $scope.$watch(function(){
      return sessionService.email;
    }, function (email) {
      if (!email) {
        $scope.needsEmail = true;
      } else {
        $scope.needsEmail = false;
      }
    });

    
    $scope.newDetails = function () {
      $http.post('/api/setUsername', $scope.user).
        success(function(data, status) {
          $location.path('/boards');
        }).
        error(function (data, status) {
          if (status === 401) {

          }
        });
    };
  });
