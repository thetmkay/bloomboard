describe('canvas', function() {
	var sketchpad;
	var drawingBoardContainer;


	function triggerMouseEvent(eventName, x, y) {
		var offset = drawingBoardContainer.offset();
		var event = jQuery.Event(eventName, {
			which: 1,
			pageX: offset.left + x,
			pageY: offset.top + y
		});
		drawingBoardContainer.trigger(event);
	}

	describe('selection', function() {

		beforeEach(function() {
			drawingBoardContainer = affix('#drawingBoard');
			sketchpad = Raphael.sketchpad("drawingBoard", {
				width: 1000,
				height: 1000
			});
		});

		afterEach(function() {
			sketchpad = null;
			drawingBoardContainer = null;
		});

		it("should not be able to draw in selection mode", function() {
			sketchpad.editing("select");
			triggerMouseEvent("mousedown", 10, 10);
			triggerMouseEvent("mousemove", 20, 50);
			triggerMouseEvent("mouseup", 20, 50);
			expect(sketchpad.strokes().length).toBe(0);
		});

		it("should return selection of objects selected inside box", function() {
			triggerMouseEvent("mousedown", 10, 10);
			triggerMouseEvent("mousemove", 20, 20);
			triggerMouseEvent("mouseup", 20, 20);

			triggerMouseEvent("mousedown", 100, 100);
			triggerMouseEvent("mousemove", 200, 200);
			triggerMouseEvent("mouseup", 200, 200);

			sketchpad.editing("select");
			triggerMouseEvent("mousedown", 5, 5);
			triggerMouseEvent("mousemove", 30, 30);
			triggerMouseEvent("mouseup", 30, 30);

			expect(sketchpad.strokes().length).toBe(2);
			expect(sketchpad.selection().length).toBe(1);
		});

		it("should return selection of objects selected intersecting box", function() {
			triggerMouseEvent("mousedown", 10, 10);
			triggerMouseEvent("mousemove", 20, 20);
			triggerMouseEvent("mouseup", 20, 20);

			triggerMouseEvent("mousedown", 100, 100);
			triggerMouseEvent("mousemove", 200, 200);
			triggerMouseEvent("mouseup", 200, 200);

			sketchpad.editing("select");
			triggerMouseEvent("mousedown", 5, 5);
			triggerMouseEvent("mousemove", 150, 150);
			triggerMouseEvent("mouseup", 150, 150);

			expect(sketchpad.strokes().length).toBe(2);
			expect(sketchpad.selection().length).toBe(2);
		});

		it("should clear selection after switching back to editing mode", function() {
			triggerMouseEvent("mousedown", 10, 10);
			triggerMouseEvent("mousemove", 20, 20);
			triggerMouseEvent("mouseup", 20, 20);

			triggerMouseEvent("mousedown", 100, 100);
			triggerMouseEvent("mousemove", 200, 200);
			triggerMouseEvent("mouseup", 200, 200);

			sketchpad.editing("select");
			triggerMouseEvent("mousedown", 5, 5);
			triggerMouseEvent("mousemove", 150, 150);
			triggerMouseEvent("mouseup", 150, 150);

			sketchpad.editing(true);

			expect(sketchpad.selection().length).toBe(0);
		});

	});
});