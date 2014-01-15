'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location, sessionService, socket) {
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
  controller('BoardCtrl', function ($scope, $location, $stateParams, drawService) {
    $scope.leaveBoard = [];
    
    $scope.boardID = $stateParams.boardID;
    
    $scope.boardName = $stateParams.boardName;
    // $("#boardData").val(persistenceService.board);
    $scope.boardText = "this is a board";
    
    $scope.$on('$destroy', function() {
      console.log('leaving');
      for(var i = 0; i < $scope.leaveBoard.length; i++) {
        $scope.leaveBoard[i]();
      }
      // if ($scope.leaveBoard) {
        
      //   $scope.leaveBoard();
      // }
    });

    // var board = Raphael.sketchpad("drawingBoard", {
    //     width: 480,
    //     height: 320,
    //     input: "#boardData"
    //   });

    // board.change(function() {
    //   $("#boardData").val(board.json());
    // });
    



  }).controller('HomeCtrl', function ($scope) {
          
         $scope.showMoreInfo = false;

         $("#moreInfoModal").foundation('reveal', {});

         $scope.clickMoreInfo = function() {
          console.log("open");
          $("#moreInfoModal").foundation('reveal', 'open');
         };

         $("#homeDrawingBoard").css({
            width: $(window).width(),
            height: $(window).height() - 85
         });

         var board = Raphael.sketchpad("homeDrawingBoard", {
            width: $("#homeDrawingBoard").width(),
            height: $("#homeDrawingBoard").height()
          });

         $(window).on('resize',function () {
            $("#homeDrawingBoard").css({
                width: $(window).width(),
                height: $(window).height() - 85
             });
            $("#homeDrawingBoard svg").css({
                width: $(window).width(),
                height: $(window).height() - 85
             });
         });


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

              $scope.boards.write.forEach(function(board) {
                board.writeAccess = true;
              });
              $scope.boards.read.forEach(function(board) {
                board.writeAccess = false;
              });

              $scope.joinedBoards = $scope.boards.read.concat($scope.boards.write);
            }).
            error(function (data, status) {
              if (status === 401) {
                sessionService.reset();
              }
            });
        }
      });

      $scope.convertDate = function (epoch) {
        return (new Date(epoch)).toLocaleString();
      };

      var reset = function () {
        $scope.boards = [];
        $scope.showRead = false;
        $scope.showWrite = false;
      };      

      $scope.clickCreateBoard = function() {
      $http.get('/api/createBoard').
        success(function (data, status) {
          $location.path('/board/' + data._id + '/untitled');
        }).
        error(function (data, status) {

        });
      };

      $scope.sortPredicate="-lastEdited";
      $scope.sort = function(pred){
        if(pred == $scope.sortPredicate)
        {
          $scope.sortPredicate = "-" + pred;
        }
        else
          $scope.sortPredicate = pred;
      };

      $scope.viewBoard = function(boardID, boardName) {
        $location.path('/board/' + boardID + '/' + boardName);
      };

  }).controller('NewUserCtrl', function ($scope, $http, $location, sessionService) {
    $scope.$watch(function(){
      return sessionService.email;
    }, function (email) {
      $scope.needsEmail = !email;
    });

    $scope.newDetails = function () {
      $http.post('/api/setUsername', $scope.user).
        success(function(data, status) {
          sessionService.getDisplayName();
          $location.path('/boards');
        }).
        error(function (data, status) {
          if (status === 401) {

          }
        });
    };
  });
