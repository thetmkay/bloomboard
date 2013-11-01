'use strict';

/* Controllers */

angular.module('bloomboard.controllers', []).
  controller('AppCtrl', function ($scope, $http) {


  }).
  controller('BoardCtrl', function ($scope) {

    $scope.boardText = "this is a board";

    var paper = new Raphael($('#drawingBoard'));
    var line_path_string;
    var mousedown = false;

    var drawMouseDown = function (e) {
            line_path_string = "M" + e.clientX + "," + e.clientY;
            mousedown = true;
    };

    var drawMouseUp = function() {
            mousedown = false;
            console.log(mousedown);
    };

    var drawMove = function(e) {
            if(mousedown){
                    line_path_string += "L" + e.clientX + "," + e.clientY;
                    var path = paper.path(line_path_string);
                    path.attr({stroke:"#000000", "stroke-width":3});           
            }
    };
    
   var drawMouseDownTouch = function (e) {
    
    	line_path_string = "M" + e.touches[0].pageX + "," + e.touches[0].pageY;
    	mousedown = true;
    };

	var drawMoveTouch = function(e) {
		e.preventDefault();
   		if(mousedown){
	    		line_path_string += "L" + e.touches[0].pageX + "," + e.touches[0].pageY;
	    		var path = paper.path(line_path_string);
	    		path.attr({stroke:"#000000", "stroke-width":3});   	
   		}
   	};

    paper.raphael.mousedown(drawMouseDown);
    paper.raphael.mousemove(drawMove);
    paper.raphael.mouseup(drawMouseUp);
    paper.raphael.touchstart(drawMouseDownTouch);
    paper.raphael.touchmove(drawMoveTouch);
    paper.raphael.touchend(drawMouseUp);

  }).controller('HomeCtrl', function ($scope) {

  }).controller('ListCtrl', function ($scope) {

  });