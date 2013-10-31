var mongodb = require('../../routes/mongo_db_lib');

describe("authenticateUser", function() {
	it("should return user == null when user is not in db", function () {
		var email = "not an email";
		var password = "password";
		mongodb.authenticateUser(email, password, function(success, user) {
			expect(success).toBeFalsy();
			expect(user).toBeNull();
		});
	});

	it("should return user data when authentication succeeds", function() {
		var email = "miten";
		var password = "password";
		mongodb.authenticateUser(email, password, function(success, user) {
			expect(success).toBeTruthy();
			expect(user.email).toEqual("miten");
		});
	});
});