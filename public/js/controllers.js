'use strict';



/* Controllers */

angular.module('bloomboard.controllers', ['ngCookies']).
  controller('AppCtrl', function ($scope, $http) {
    $scope.activeSession = false;
    $http.get('/api/getDisplayName').
      success(function (data) {
        $scope.username = data.displayName;
        $scope.setActiveSession(true);
      }).
      error(function (data, status){
        if (status === 401) {
          $scope.username = null;
          $scope.setActiveSession(false);
        }
      });

    $scope.setActiveSession = function (value) {
      $scope.activeSession = value;
    };


  }).
  controller('BoardCtrl', function ($scope, $location, persistenceService) {

    if (!$scope.activeSession) {
      $location.path('/login');
    }
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
      
      
      // $scope.$on('login', function() {
      //   if ($cookies.hasOwnProperty('userData')) {
      //     $scope.activeSession = true;
      //   } else {
      //     $scope.activeSession = false;
      //   }
      // });

      $scope.clickLogout = function () {
        $http.get('/api/logout').
          success(function (data) {
            $scope.setActiveSession(false);
            $scope.redirectTo('login');
          });
      };

      $scope.redirectTo = function(urlpath) {
        $location.path(urlpath);
      };

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {
  // }).controller('LoginCtrl', LoginCtrl);
  }).controller('LoginCtrl', function ($scope, $http, $location, $cookies){  
    $scope.loginData = function() {
      $http.post('/api/login', $scope.login).
        success(function (data) {
          console.log(JSON.stringify(data, null, 4));
          $location.path('/home');
          $scope.setActiveSession(true);
        }).
        error(function (data, status) {
          if (status === 401) {
            console.log('Doesnt exist');
          }
        });
    };

    $scope.createUser = function() {
      if (!$scope.create.user.hasOwnProperty('displayName') || $scope.create.user.displayName.length === 0){
        $scope.displayName = 'anonymous';
      }
      $http.post('/api/createUser', $scope.create).
        success(function (data) {
          console.log(JSON.stringify(data, null, 4));
          $scope.setActiveSession(true);
          $location.path('/home');
        }).
        error(function (data, status) {
          if (status === 401) {
            console.log('User exists');
          }
        });
    };


    $scope.showLogin = false;
    $scope.showSignUp = false;
  });


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
