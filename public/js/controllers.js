'use strict';

/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $http) {


  }).
  controller('BoardCtrl', function ($scope, persistenceService) {

    $scope.boardText = "this is a board";

    var paper = new Raphael(document.getElementById('drawingBoard'));
    var line_path_string;
    var mousedown = false;

    var drawMouseDown = function (e) {
            line_path_string = "M" + e.clientX + "," + e.clientY;
            mousedown = true;
    };

    var drawMouseUp = function() {
            mousedown = false;
            console.log(mousedown);
            var json = paper.toJSON();
            persistenceService.saveBoard(json);
    };

    var drawMove = function(e) {
            if(mousedown){
                    line_path_string += "L" + e.clientX + "," + e.clientY;
                    var path = paper.path(line_path_string);
                    path.attr({stroke:"#000000", "stroke-width":3}); 
            }
    };

    persistenceService.boardData.async().then(function(boardDataJSON) {
        paper.fromJSON(boardDataJSON.data);
    });

    paper.raphael.mousedown(drawMouseDown);
    paper.raphael.mousemove(drawMove);
    paper.raphael.mouseup(drawMouseUp);

  }).controller('BoardHeaderCtrl', function ($scope, $http, $location) {
      $scope.login = function() {
        $location.path('/login');
      };

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {

  }).controller('LoginCtrl', function ($scope, $http, $location){
    $scope.login = function() {
      $http.post('/api/login', $scope.login).
        success(function (data){
          $location.path('/home');
        });
    };
  });
