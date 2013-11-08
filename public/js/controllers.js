'use strict';



/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $location) {
    $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };
  }).
  controller('BoardCtrl', function ($scope, $location, persistenceService) {

    // if (!$scope.activeSession) {
    //   $location.path('/login');
    // }
    $scope.boardText = "this is a board";

    var board = Raphael.sketchpad("drawingBoard", {
        width: 480,
        height: 320,
        input: "#boardData"
      });

    board.change(function() {
      $("#boardData").val(board.json());
    });

  }).controller('BoardHeaderCtrl', function ($scope, $http, $location, sessionService) {
      
      
      // $scope.$on('login', function() {
      //   if ($cookies.hasOwnProperty('userData')) {
      //     $scope.activeSession = true;
      //   } else {
      //     $scope.activeSession = false;
      //   }
      // });
      $scope.$watch(function() {return sessionService.displayName;}, function(displayName) {$scope.displayName = displayName;});
      $scope.$watch(function() {return sessionService.activeSession;}, function(activeSession) {$scope.activeSession = activeSession;});
      //$scope.activeSession = sessionService.activeSession;
      //
      $scope.clickLogout = function () {
        sessionService.logout();
      }

  }).controller('HomeCtrl', function ($scope) {
  
  }).controller('ListCtrl', function ($scope) {

  });
  // // }).controller('LoginCtrl', LoginCtrl);
  // }).controller('LoginCtrl', function ($scope, $http, $location, $cookies){  
  //   $scope.loginData = function() {
  //     $http.post('/api/login', $scope.login).
  //       success(function (data) {
  //         console.log(JSON.stringify(data, null, 4));
  //         $location.path('/home');
  //         $scope.setActiveSession(true);
  //       }).
  //       error(function (data, status) {
  //         if (status === 401) {
  //           console.log('Doesnt exist');
  //         }
  //       });
  //   };

  //   $scope.createUser = function() {
  //     if (!$scope.create.user.hasOwnProperty('displayName') || $scope.create.user.displayName.length === 0){
  //       $scope.displayName = 'anonymous';
  //     }
  //     $http.post('/api/createUser', $scope.create).
  //       success(function (data) {
  //         console.log(JSON.stringify(data, null, 4));
  //         $scope.setActiveSession(true);
  //         $location.path('/home');
  //       }).
  //       error(function (data, status) {
  //         if (status === 401) {
  //           console.log('User exists');
  //         }
  //       });
  //   };


  //   $scope.showLogin = false;
  //   $scope.showSignUp = false;
  // });


// var LoginCtrl = function ($scope, $http, $location){
    
//     $scope.loginData = function() {
//       console.log($scope.test);
//       $http.post('/api/login', $scope.login).
//         success(function (data) {
//           console.log(JSON.stringify(data, null, 4));
//           $location.path('/home');
//         }).
//         error(function (data, status) {
//           if (status === 401) {
//             console.log('Doesnt exist');
//           }
//         });
//     };

//     $scope.createUser = function() {
//       if (!$scope.create.user.hasOwnProperty('displayName') || $scope.create.user.displayName.length === 0){
//         $scope.displayName = 'anonymous';
//       }
      
//       $http.post('/api/createUser', $scope.create).
//         success(function (data) {
//           console.log(JSON.stringify(data, null, 4));

//           $location.path('/home');
//         }).
//         error(function (data, status) {
//           if (status === 401) {
//             console.log('User exists');
//           }
//         });
//     };


//     $scope.showLogin = false;
//     $scope.showSignUp = false;
//   };
