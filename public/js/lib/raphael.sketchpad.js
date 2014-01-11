/*
 * Raphael SketchPad
 * Version 0.5.1
 * Copyright (c) 2011 Ian Li (http://ianli.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *
 * Requires:
 * jQuery	http://jquery.com
 * Raphael	http://raphaeljs.com
 * JSON		http://www.json.org/js.html
 *
 * Reference:
 * http://ianli.com/sketchpad/ for Usage
 *
 * Versions:
 * 0.5.1 - Fixed extraneous lines when first line is drawn.
 *         Thanks to http://github.com/peterkeating for the fix!
 * 0.5.0 - Added freeze_history. Fixed bug with undoing erase actions.
 * 0.4.0 - Support undo/redo of strokes, erase, and clear.
 *       - Removed input option. To make editors/viewers, set editing option to true/false, respectively.
 *         To update an input field, listen to change event and update input field with json function.
 *       - Reduce file size V1. Changed stored path info from array into a string in SVG format.
 * 0.3.0 - Added erase, supported initializing data from input field.
 * 0.2.0 - Added iPhone/iPod Touch support, onchange event, animate.
 * 0.1.0 - Started code.
 *
 * TODO:
 * - Speed up performance.
 *   - Don't store strokes in two places. _strokes and ActionHistory.current_strokes()
 *	 - Don't rebuild strokes from history with ActionHistory.current_strokes()
 * - Reduce file size.
 *   X V1. Changed stored path info from array into a string in SVG format.
 */

/**
 * We use this wrapper to control global variables.
 * The only global variable we expose is Raphael.sketchpad.
 */

(function(Raphael) {

	/**
	 * Function to create SketchPad object.
	 */
	Raphael.sketchpad = function(paper, options) {
		return new SketchPad(paper, options);
	}

	// Current version.
	Raphael.sketchpad.VERSION = '0.5.1';

	/**
	 * The Sketchpad object.
	 */
	var SketchPad = function(paper, options) {
		// Use self to reduce confusion about this.
		var self = this;

		var _options = {
			width: 100,
			height: 100,
			strokes: [],
			editing: true
		};
		jQuery.extend(_options, options);


		// The Raphael context to draw on.
		var _paper;
		if (paper.raphael && paper.raphael.constructor == Raphael.constructor) {
			_paper = paper;
		} else if (typeof paper == "string") {
			_paper = Raphael(paper, _options.width, _options.height);
		} else {
			throw "first argument must be a Raphael object, an element ID, an array with 3 elements";
		}

		// The Raphael SVG canvas.
		var _canvas = _paper.canvas;

		// The HTML element that contains the canvas.
		var _container = $(_canvas).parent();

		// the default selected colour
		var _select_colour = "#ff6b4f";

		//the box we're going to draw to track the selection
		var box;
		//set that will receive the selected items
		var selection = _paper.set();

		// The default pen.
		var _pen = new Pen();

		// Array of Pens from concurrent users
		var _con_pens = {};

		self.add_current_users = function(con_pens) {
			for (var i = 0; i < con_pens.length; i++) {
				var penObj = new Pen();
				penObj.color(con_pens[i].color);
				penObj.opacity = con_pens[i].opacity;
				penObj.width = con_pens[i].width;
				_con_pens[i] = penObj;
			}
		};


		// Public Methods
		//-----------------

		self.paper = function() {
			return _paper;
		};

		self.canvas = function() {
			return _canvas;
		};

		self.container = function() {
			return _container;
		};

		self.pen = function(value) {
			if (value === undefined) {
				return _pen;
			}
			_pen = value;
			return self; // function-chaining
		};

		self.new_concurrent_user = function(penObj, userID) {
			console.log(penObj);
			var pen = new Pen();

			if (typeof penObj !== "undefined") {
				pen.color(penObj);
				pen.opacity = penObj.opacity;
				pen.width = penObj.width;
			}
			_con_pens[userID] = pen;
		};

		self.con_pen_change = function(colour, userID) {
			if (typeof _con_pens[userID] !== "undefined") {
				_con_pens[userID].color(colour);
			}
		};

		// Convert an SVG path into a string, so that it's smaller when JSONified.
		// This function is used by json().

		self.svg_path_to_string = function(path) {
			var str = "";
			for (var i = 0, n = path.length; i < n; i++) {
				var point = path[i];
				str += point[0] + point[1] + "," + point[2];
			}
			return str;
		};

		// Convert a string into an SVG path. This reverses the above code.

		self.string_to_svg_path = function(str) {
			var path = [];
			var tokens = str.split("L");

			if (tokens.length > 0) {
				var token = tokens[0].replace("M", "");
				var points = token.split(",");
				path.push(["M", parseInt(points[0]), parseInt(points[1])]);

				for (var i = 1, n = tokens.length; i < n; i++) {
					token = tokens[i];
					points = token.split(",");
					path.push(["L", parseInt(points[0]), parseInt(points[1])]);
				}
			}
			return path;
		}

		self.json = function(value, options) {
			var options = options || {
				fireChange: true,
				overwrite: true
			};
			if (options.fireChange === undefined) {
				options.fireChange = true;
			}
			if (options.overwrite === undefined) {
				options.overwrite = true;
			}
			if (value === undefined) {
				for (var i = 0, n = _strokes.length; i < n; i++) {
					var stroke = _strokes[i];
					if (typeof stroke.path == "object") {
						stroke.path = self.svg_path_to_string(stroke.path);
					}
				}
				return _strokes;
			}

			return self.strokes(value, options);
		};

		self.strokes = function(value, options) {
			if (value === undefined) {
				return _strokes;
			}
			if (jQuery.isArray(value)) {
				if (options.overwrite) {
					_strokes = value;
				} else {
					_strokes.push(value[0]);
				}
				for (var i = 0, n = _strokes.length; i < n; i++) {
					var stroke = _strokes[i];
					if (typeof stroke.path == "string") {
						stroke.path = self.string_to_svg_path(stroke.path);
					}
				}

				_action_history.add({
					type: "batch",
					strokes: jQuery.merge([], _strokes) // Make a copy.
				})

				_redraw_strokes();
				if (options.fireChange) {
					_fire_change();
				}

			}
			return self; // function-chaining
		}

		self.freeze_history = function() {
			_action_history.freeze();
		};

		self.undoable = function() {
			return _action_history.undoable();
		};

		self.undo = function() {
			if (_action_history.undoable()) {
				_action_history.undo();
				_strokes = _action_history.current_strokes();
				_redraw_strokes();
				_fire_change();
			}
			return self; // function-chaining
		};

		self.redoable = function() {
			return _action_history.redoable();
		};

		self.redo = function() {
			if (_action_history.redoable()) {
				_action_history.redo();
				_strokes = _action_history.current_strokes();
				_redraw_strokes();
				_fire_change();
			}
			return self; // function-chaining
		};

		self.clear = function() {
			_action_history.add({
				type: "clear"
			});

			_strokes = [];
			_redraw_strokes();
			_fire_change();

			return self; // function-chaining
		};

		self.animate = function(ms) {
			if (ms === undefined) {
				ms = 500;
			}

			_paper.clear();

			if (_strokes.length > 0) {
				var i = 0;

				function animate() {
					var stroke = _strokes[i];
					var type = stroke.type;
					_paper[type]()
						.attr(stroke)
						.click(_pathclick);

					i++;
					if (i < _strokes.length) {
						setTimeout(animate, ms);
					}
				};

				animate();
			}

			return self; // function-chaining
		};

		self.selection = function() {
			return selection.items;
		};

		function unbind_draw_event_handlers(isMobile) {
			$(_container).unbind("mousedown", _mousedown);
			$(_container).unbind("mousemove", _mousemove);
			$(_container).unbind("mouseup", _mouseup);
			$(document).unbind("mouseup", _mouseup); // iPhone Events
			if (isMobile) {
				$(_container).unbind("touchstart", _touchstart);
				$(_container).unbind("touchmove", _touchmove);
				$(_container).unbind("touchend", _touchend)
			}
		}

		function bind_draw_event_handlers(isMobile) {
			$(_container).mousedown(_mousedown);
			$(_container).mousemove(_mousemove);
			$(_container).mouseup(_mouseup); // Handle the case when the mouse is released outside the canvas.
			$(document).mouseup(_mouseup); // iPhone Events
			if (isMobile) {
				$(_container).bind("touchstart", _touchstart);
				$(_container).bind("touchmove", _touchmove);
				$(_container).bind("touchend", _touchend)
			}
		}

		function unbind_select_event_handlers(isMobile) {
			self.clearSelected();
			$(_container).unbind("mousedown", _selectdown);
			$(_container).unbind("mousemove", _selectmove);
			$(_container).unbind("mouseup", _selectup);
			$(document).unbind("mouseup", _selectup); // iPhone Events
			if (isMobile) {
				// $(_container).unbind("touchstart", _touchstart);
				// $(_container).unbind("touchmove", _touchmove);
				// $(_container).unbind("touchend", _touchend)
			}
		}

		function bind_select_event_handlers(isMobile) {
			$(_container).mousedown(_selectdown);
			$(_container).mousemove(_selectmove);
			$(_container).mouseup(_selectup); // Handle the case when the mouse is released outside the canvas.
			$(document).mouseup(_selectup); // iPhone Events
			if (isMobile) {
				// $(_container).bind("touchstart", _touchstart);
				// $(_container).bind("touchmove", _touchmove);
				// $(_container).bind("touchend", _touchend)
			}
		}


		self.editing = function(mode) {
			var agent = navigator.userAgent;
			var isMobile = agent.indexOf("iPhone") > 0 || agent.indexOf("iPod") > 0 || agent.indexOf("iPad") > 0 || agent.indexOf("Android") > 0;
			if (mode === undefined) {
				return _options.editing;
			}

			_options.editing = mode;
			if (_options.editing) {
				if (_options.editing === "erase") {
					// Cursor is crosshair, so it looks like we can do something.
					$(_container).css("cursor", "crosshair");
					unbind_draw_event_handlers(isMobile);
					unbind_select_event_handlers(isMobile);

				} else if (_options.editing === "select") {
					// console.log("select mode selected");
					// Cursor is crosshair, so it looks like we can do something.
					$(_container).css("cursor", "pointer");
					unbind_draw_event_handlers(isMobile);
					bind_select_event_handlers(isMobile);
				} else {
					// console.log("draw mode selected");
					// Cursor is crosshair, so it looks like we can do something.
					$(_container).css("cursor", "crosshair");
					unbind_select_event_handlers(isMobile);
					bind_draw_event_handlers(isMobile);
				}
			} else {
				// Reverse the settings above.
				$(_container).attr("style", "cursor:default");
				unbind_draw_event_handlers(isMobile);
				unbind_select_event_handlers(isMobile);
			}

			return self; // function-chaining
		}

		// Change events
		//----------------

		var _change_fn = function() {};
		self.change = function(fn) {
			if (fn == null || fn === undefined) {
				_change_fn = function() {};
			} else if (typeof fn == "function") {
				_change_fn = fn;
			}
		};

		function _fire_change() {
			_change_fn();
		};

		var _mousedown_fn = function() {};
		self.mousedown = function(fn) {
			if (fn == null || fn === undefined) {
				_mousedown_fn = function() {};
			} else if (typeof fn == "function") {
				_mousedown_fn = fn;
			}
		};

		self._fire_mousedown = function(e) {
			_mousedown_fn(e);
		};

		var _mousemove_fn = function() {};
		self.mousemove = function(fn) {
			if (fn == null || fn === undefined) {
				_mousemove_fn = function() {};
			} else if (typeof fn == "function") {
				_mousemove_fn = fn;
			}
		};

		self._fire_mousemove = function(path) {
			_mousemove_fn(path);
		};

		var _mouseup_fn = function() {};
		self.mouseup = function(fn) {
			if (fn == null || fn === undefined) {
				_mouseup_fn = function() {};
			} else if (typeof fn == "function") {
				_mouseup_fn = fn;
			}
		};

		self._fire_mouseup = function(path) {
			_mouseup_fn(path);
		};

		// Miscellaneous methods
		//------------------

		function _redraw_strokes() {
			_paper.clear();

			for (var i = 0, n = _strokes.length; i < n; i++) {
				var stroke = _strokes[i];
				var type = stroke.type;
				_paper[type]()
					.attr(stroke)
					.click(_pathclick);
			}
		};

		self.clearSelected = function() {
			selection = _paper.set();
			_redraw_strokes();
		};

		function _disable_user_select() {
			$("*").css("-webkit-user-select", "none");
			$("*").css("-moz-user-select", "none");
			if (jQuery.browser) {
				if (jQuery.browser.msie) {
					$("body").attr("onselectstart", "return false;");
				}
			}
		}

		function _enable_user_select() {
			$("*").css("-webkit-user-select", "text");
			$("*").css("-moz-user-select", "text");
			if (jQuery.browser) {
				if (jQuery.browser.msie) {
					$("body").removeAttr("onselectstart");
				}
			}
		}

		// Event handlers
		//-----------------
		// We can only attach events to the container, so do it.

		function _pathclick(e) {
			if (_options.editing == "erase") {
				var stroke = this.attr();
				stroke.type = this.type;

				_action_history.add({
					type: "erase",
					stroke: stroke
				});

				for (var i = 0, n = _strokes.length; i < n; i++) {
					var s = _strokes[i];
					if (equiv(s, stroke)) {
						_strokes.splice(i, 1);
					}
				}

				_fire_change();

				this.remove();
			}
			// if (_options.editing = "move") {
			// 	var stroke = this.attr();
			// 	stroke.type = this.type;

			// 	// _action_history.add({
			// 	// 	type: "move",
			// 	// 	stroke: stroke
			// 	// });

			if (_options.editing === "select") {
				var oldStroke = this.attr() || this.attrs;
				var stroke = this.attr() || this.attrs;
				stroke.type = this.type;
				var colour = stroke.stroke;

				// if not selected already
				if (stroke.stroke !== _select_colour) {
					// select
					stroke.normalColour = colour;
					stroke.stroke = _select_colour;
					_selected_strokes.push(stroke);
				} else {
					// deselect
					for (var i = 0, n = _selected_strokes.length; i < n; i++) {
						var s = _selected_strokes[i];
						if (s.path.compare(stroke.path)) {
							stroke.stroke = s.normalColour;
							_selected_strokes.splice(i, 1);
						}
					}
				}


				// redraw the affected stroke
				this.remove();
				var type = stroke.type;
				_paper[type]()
					.attr(stroke)
					.click(_pathclick);

			}


			// }
		};

		self.con_mouse_down = function(e, userID) {
			//assume userID in _con_pens array
			_disable_user_select();
			_con_pens[userID].start(e, self);
		};

		self.con_mouse_move = function(data, userID) {
			//assume userID in _con_pens array
			_con_pens[userID].con_move(data.data);
		};

		self.con_mouse_up = function(path_, userID) {
			//assume userID in _con_pens array
			_enable_user_select();
			var path = _con_pens[userID].con_finish(path_, this);

			if (path != null) {
				// Add event when clicked.
				path.events = [];
				path.events.push({
					f: _pathclick,
					name: "click"
				});
				path.click(_pathclick);

				// Save the stroke.
				var stroke = path.attrs;
				stroke.type = path.type;

				_strokes.push(stroke);

				_action_history.add({
					type: "stroke",
					stroke: stroke
				});

			}
		};

		function _mousedown(e) {
			_disable_user_select();

			_pen.start(e, self);
			self._fire_mousedown(e);
		};

		function _mousemove(e) {
			_pen.move(e, self);
			//fire mouse move done inside pen
		};

		function _mouseup(e) {
			_enable_user_select();

			var path = _pen.finish(e, self);


			if (path != null) {
				// Add event when clicked.
				path.click(_pathclick);

				// Save the stroke.
				var stroke = path.attr();
				stroke.type = path.type;

				_strokes.push(stroke);

				_action_history.add({
					type: "stroke",
					stroke: stroke
				});

				// _fire_mouseup(e);
				_fire_change();
			}
		};


		var box_x, box_y, is_selected, _offset, _objects;

		function _selectdown(e) {
			_offset = $(_container).offset();
			box_x = e.pageX - _offset.left;
			box_y = e.pageY - _offset.top;
			box = _paper.rect(box_x, box_y, 0, 0).attr("stroke", "#9999FF");
			is_selected = true;
		};

		function _selectmove(e) {
			if (is_selected) {
				var dx = e.pageX - _offset.left - box_x;
				var dy = e.pageY - _offset.top - box_y;

				var xoffset = 0,
					yoffset = 0;
				if (dx < 0) {
					xoffset = dx;
					dx = -1 * dx;
				}
				if (dy < 0) {
					yoffset = dy;
					dy = -1 * dy;
				}
				box.transform("T" + xoffset + "," + yoffset);
				box.attr("width", dx);
				box.attr("height", dy);
			}
		};

		function _selectup(e) {
			if (is_selected) {
				selection.attr({
					stroke: _pen.color()
				});
				selection = _paper.set();
				var bounds = box.getBBox();
				is_selected = false;
				box.remove();
				_paper.forEach(function(object) {
					for (var i in object.attrs.path) {
						if (Raphael.isPointInsideBBox(bounds, object.attrs.path[i][1], object.attrs.path[i][2])) {
							selection.push(object);
							break;
						}
					}
				});
				selection.attr({
					stroke: _select_colour
				});
				is_selected = false;
			}
		};

		function _touchstart(e) {
			e = e.originalEvent;
			e.preventDefault();

			if (e.touches.length == 1) {
				var touch = e.touches[0];
				_mousedown(touch);
			}
		};

		function _touchmove(e) {
			e = e.originalEvent;
			e.preventDefault();

			if (e.touches.length == 1) {
				var touch = e.touches[0];
				_mousemove(touch);
			}
		};

		function _touchend(e) {
			e = e.originalEvent;
			e.preventDefault();

			_mouseup(e);
		};

		// Setup
		//--------

		var _action_history = new ActionHistory();

		// Path data
		var _strokes = _options.strokes;
		if (jQuery.isArray(_strokes) && _strokes.length > 0) {
			_action_history.add({
				type: "init",
				strokes: jQuery.merge([], _strokes) // Make a clone.
			});
			_redraw_strokes();
		} else {
			_strokes = [];
			_redraw_strokes();
		}

		self.editing(_options.editing);
	};

	var ActionHistory = function() {
		var self = this;

		var _history = [];

		// Index of the last state.
		var _current_state = -1;

		// Index of the freeze state.
		// The freeze state is the state where actions cannot be undone.
		var _freeze_state = -1;

		// The current set of strokes if strokes were to be rebuilt from history.
		// Set to null to force refresh.
		var _current_strokes = null;

		self.add = function(action) {
			if (_current_state + 1 < _history.length) {
				_history.splice(_current_state + 1, _history.length - (_current_state + 1));
			}

			_history.push(action);
			_current_state = _history.length - 1;

			// Reset current strokes.
			_current_strokes = null;
		};

		self.freeze = function(index) {
			if (index === undefined) {
				_freeze_state = _current_state;
			} else {
				_freeze_state = index;
			}
		};

		self.undoable = function() {
			return (_current_state > -1 && _current_state > _freeze_state);
		};

		self.undo = function() {
			if (self.undoable()) {
				_current_state--;

				// Reset current strokes.
				_current_strokes = null;
			}
		};

		self.redoable = function() {
			return _current_state < _history.length - 1;
		};

		self.redo = function() {
			if (self.redoable()) {
				_current_state++;

				// Reset current strokes.
				_current_strokes = null;
			}
		};

		// Rebuild the strokes from history.
		self.current_strokes = function() {
			if (_current_strokes == null) {
				var strokes = [];
				for (var i = 0; i <= _current_state; i++) {
					var action = _history[i];
					switch (action.type) {
						case "init":
						case "json":
						case "strokes":
						case "batch":
							jQuery.merge(strokes, action.strokes);
							break;
						case "stroke":
							strokes.push(action.stroke);
							break;
						case "erase":
							for (var s = 0, n = strokes.length; s < n; s++) {
								var stroke = strokes[s];
								if (equiv(stroke, action.stroke)) {
									strokes.splice(s, 1);
								}
							}
							break;
						case "clear":
							strokes = [];
							break;
					}
				}

				_current_strokes = strokes;
			}
			return _current_strokes;
		};
	};

	/**
	 * The default Pen object.
	 */
	var Pen = function() {
		var self = this;

		var _color = "#000000";
		var _opacity = 1.0;
		var _width = 5;
		var _offset = null;

		// Drawing state
		var _drawing = false;
		var _c = null;
		var _points = [];

		self.color = function(value) {
			if (value === undefined) {
				return _color;
			}

			_color = value;

			return self;
		};

		self.width = function(value) {
			if (value === undefined) {
				return _width;
			}

			if (value < Pen.MIN_WIDTH) {
				value = Pen.MIN_WIDTH;
			} else if (value > Pen.MAX_WIDTH) {
				value = Pen.MAX_WIDTH;
			}

			_width = value;

			return self;
		}

		self.opacity = function(value) {
			if (value === undefined) {
				return _opacity;
			}

			if (value < 0) {
				value = 0;
			} else if (value > 1) {
				value = 1;
			}

			_opacity = value;

			return self;
		}

		self.start = function(e, sketchpad) {
			_drawing = true;

			_offset = $(sketchpad.container()).offset();

			var x = e.pageX - _offset.left,
				y = e.pageY - _offset.top;
			_points.push([x, y]);

			_c = sketchpad.paper().path();
			var path_ = points_to_svg();
			_c.attr({
				stroke: _color,
				"stroke-opacity": _opacity,
				"stroke-width": _width,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				path: path_
			});
		};


		self.finish = function(e, sketchpad) {
			var path = null;

			if (_c != null) {
				if (_points.length < 1) {
					_c.remove();
				} else {
					path = _c;
				}
			}

			_drawing = false;
			_c = null;
			_points = [];

			if (path != null) {
				sketchpad._fire_mouseup({});
			}
			return path;
		};

		self.con_finish = function(data, sketchpad) {
			if (_drawing == true) {
				var path = null;

				if (_c != null) {
					if (_points.length < 1) {
						_c.remove();
					} else {
						path = _c;
					}
				}

				_drawing = false;
				_c = null;
				_points = [];
				return path;
			} else {
				return null;
			}
		};

		self.move = function(e, sketchpad) {
			if (_drawing == true) {
				var x = e.pageX - _offset.left,
					y = e.pageY - _offset.top;
				_points.push([x, y]);
				var path_ = points_to_svg();
				_c.attr({
					path: path_
				});
				sketchpad._fire_mousemove({
					pageX: e.pageX,
					pageY: e.pageY,
					path: path_
				});
			}
		};

		self.con_move = function(data, sketchpad) {
			if (_drawing == true) {
				var x = data.pageX - _offset.left,
					y = data.pageY - _offset.top;
				_points.push([x, y]);
				_c.attr({
					path: data.path
				});
			}
		};

		function points_to_svg() {
			if (_points != null && _points.length == 1) {
				var p = _points[0];
				var path = "M" + p[0] + "," + p[1];
				path += " L" + p[0] + "," + p[1];
				return path;
			}
			if (_points != null && _points.length > 1) {
				var p = _points[0];
				var path = "M" + p[0] + "," + p[1];
				for (var i = 1, n = _points.length; i < n; i++) {
					p = _points[i];
					path += "L" + p[0] + "," + p[1];
				}
				return path;
			} else {
				return "";
			}
		};
	};

	Pen.MAX_WIDTH = 1000;
	Pen.MIN_WIDTH = 1;

	/**
	 * Utility to generate string representation of an object.
	 */

	function inspect(obj) {
		var str = "";
		for (var i in obj) {
			str += i + "=" + obj[i] + "\n";
		}
		return str;
	}

})(window.Raphael);

Raphael.fn.display = function(elements) {
	for (var i = 0, n = elements.length; i < n; i++) {
		var e = elements[i];
		var type = e.type;
		this[type]().attr(e);
	}
};


/**
 * Utility functions to compare objects by Phil Rathe.
 * http://philrathe.com/projects/equiv
 */

// Determine what is o.

function hoozit(o) {
	if (o.constructor === String) {
		return "string";

	} else if (o.constructor === Boolean) {
		return "boolean";

	} else if (o.constructor === Number) {

		if (isNaN(o)) {
			return "nan";
		} else {
			return "number";
		}

	} else if (typeof o === "undefined") {
		return "undefined";

		// consider: typeof null === object
	} else if (o === null) {
		return "null";

		// consider: typeof [] === object
	} else if (o instanceof Array) {
		return "array";

		// consider: typeof new Date() === object
	} else if (o instanceof Date) {
		return "date";

		// consider: /./ instanceof Object;
		//           /./ instanceof RegExp;
		//          typeof /./ === "function"; // => false in IE and Opera,
		//                                          true in FF and Safari
	} else if (o instanceof RegExp) {
		return "regexp";

	} else if (typeof o === "object") {
		return "object";

	} else if (o instanceof Function) {
		return "function";
	} else {
		return undefined;
	}
}

// Call the o related callback with the given arguments.

function bindCallbacks(o, callbacks, args) {
	var prop = hoozit(o);
	if (prop) {
		if (hoozit(callbacks[prop]) === "function") {
			return callbacks[prop].apply(callbacks, args);
		} else {
			return callbacks[prop]; // or undefined
		}
	}
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe RathÃ© <prathe@gmail.com>

var equiv = function() {

	var innerEquiv; // the real equiv function
	var callers = []; // stack to decide between skip/abort functions


	var callbacks = function() {

		// for string, boolean, number and null
		function useStrictEquality(b, a) {
			if (b instanceof a.constructor || a instanceof b.constructor) {
				// to catch short annotaion VS 'new' annotation of a declaration
				// e.g. var i = 1;
				//      var j = new Number(1);
				return a == b;
			} else {
				return a === b;
			}
		}

		return {
			"string": useStrictEquality,
			"boolean": useStrictEquality,
			"number": useStrictEquality,
			"null": useStrictEquality,
			"undefined": useStrictEquality,

			"nan": function(b) {
				return isNaN(b);
			},

			"date": function(b, a) {
				return hoozit(b) === "date" && a.valueOf() === b.valueOf();
			},

			"regexp": function(b, a) {
				return hoozit(b) === "regexp" &&
					a.source === b.source && // the regex itself
				a.global === b.global && // and its modifers (gmi) ...
				a.ignoreCase === b.ignoreCase &&
					a.multiline === b.multiline;
			},

			// - skip when the property is a method of an instance (OOP)
			// - abort otherwise,
			//   initial === would have catch identical references anyway
			"function": function() {
				var caller = callers[callers.length - 1];
				return caller !== Object &&
					typeof caller !== "undefined";
			},

			"array": function(b, a) {
				var i;
				var len;

				// b could be an object literal here
				if (!(hoozit(b) === "array")) {
					return false;
				}

				len = a.length;
				if (len !== b.length) { // safe and faster
					return false;
				}
				for (i = 0; i < len; i++) {
					if (!innerEquiv(a[i], b[i])) {
						return false;
					}
				}
				return true;
			},

			"object": function(b, a) {
				var i;
				var eq = true; // unless we can proove it
				var aProperties = [],
					bProperties = []; // collection of strings

				// comparing constructors is more strict than using instanceof
				if (a.constructor !== b.constructor) {
					return false;
				}

				// stack constructor before traversing properties
				callers.push(a.constructor);

				for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

					aProperties.push(i); // collect a's properties

					if (!innerEquiv(a[i], b[i])) {
						eq = false;
					}
				}

				callers.pop(); // unstack, we are done

				for (i in b) {
					bProperties.push(i); // collect b's properties
				}

				// Ensures identical properties name
				return eq && innerEquiv(aProperties.sort(), bProperties.sort());
			}
		};
	}();

	innerEquiv = function() { // can take multiple arguments
		var args = Array.prototype.slice.apply(arguments);
		if (args.length < 2) {
			return true; // end transition
		}

		return (function(a, b) {
			if (a === b) {
				return true; // catch the most you can
			} else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
				return false; // don't lose time with error prone cases
			} else {
				return bindCallbacks(a, callbacks, [b, a]);
			}

			// apply transition with (1..n) arguments
		})(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length - 1));
	};

	return innerEquiv;

}();