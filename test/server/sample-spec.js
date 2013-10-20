var sample = require('../../sample');

describe("multiplication", function() {
	it("should multiply 3 and 5", function() {
		var product = sample.multiply(3,5);
		expect(product).toBe(15);
	});

	it("should multiply 5 and 25", function() {
		var product = sample.multiply(5,25);
		expect(product).toBe(125);
	});
});