'use strict';

/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $http) {


  }).
  controller('BoardCtrl', function ($scope, persistenceService, socket) {

    $scope.boardText = "this is a board";
    
    var paper = new Raphael($('#drawingBoard'));
    var line_path_string;
    var mousedown = false;

    var sketchpad = Raphael.sketchpad("editor", {
        width: 400,
        height: 400,
        editing: true
    });

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

    socket.on('connect', function() {
        sketchpad.change(function() {
            $('#drawingBoard').val(sketchpad.json());
            socket.emit('draw', $('#drawingBoard').val());
        });
    });

// socket listener

    socket.on('update_sketch', function (data) {
      sketchpad.json(data);
       $('#drawingBoard').val(sketchpad.json());
    });

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {

  });
