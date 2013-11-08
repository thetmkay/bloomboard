var db = require('mongoskin').db('mongodb://niket:kiwi@paulo.mongohq.com:10077/bloomboard_test', {
	w: 1
});
var mongo_lib = require('../../routes/mongo_db_lib');


mongo_lib.loadDB(db);

describe("saveBoardData", function() {
	beforeEach(function(done) {
		db.createCollection('boards', function(err, collection) {

		});
		done();
	});

	afterEach(function() {
		db.collection('boards').drop();
	}); 

	it('should save regular without errors to the database', function(done) {
		var fakeBoardData = {
			data: "checkDataValue21"
		};

		mongo_lib.saveBoard("testBoard2", fakeBoardData, function(err, doc) {
			expect(err == null).toBeTruthy();
			console.log("returned doc: ", doc);
			done();
		});
	});

	it('should save over an existing board without errors', function(done) {
		var fakeBoardData = {
			data: "checkDataValue21"
		};

		mongo_lib.saveBoard("testBoard2", fakeBoardData, function(err, doc) {
			expect(err == null).toBeTruthy();
			done();
		});
	});
}); 

describe("addUser", function() {
	beforeEach(function(done) {
		var userDetails = {
			email: "secondtest@mail.com",
			name: "atest",
			surname: "atester"
		};

		db.createCollection('users', function(err, collection) {

		});

		db.collection('users').ensureIndex("email", {unique: true}, function(err, succ) {
			// console.log('index added');
		});

		mongo_lib.addUser(userDetails, "password", function(success) {
			done();
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should successfully add a user to the database with a hash", function(done) {
		var userDetails = {
			email: "test@mail.com",
			name: "test",
			surname: "tester"
		};
		var password = password;

		mongo_lib.addUser(userDetails, password, function(success) {
			expect(success).toBeTruthy();
			db.collection('users').findOne({
				email: userDetails.email
			}, function(err, user) {
				expect(user).not.toBeNull();
				expect(user.email).toMatch(userDetails.email);
				expect(user.hash).not.toBeUndefined();
				done();
			});
		});
	});

	it("should return false if user is already added", function(done) {
		var userDetails = {
			email: "secondtest@mail.com",
			name: "atest",
			surname: "atester"
		};
		var password = "password";

		mongo_lib.addUser(userDetails, password, function(success) {
			expect(success).toBeFalsy();
			done();
		});



	});


}); 

describe("authenticateUser (relies on addUser tests passing)", function() {

	beforeEach(function(done) {
		db.createCollection('users', function(err, collection) {
			// a collection
		});
		var users = db.collection('users');
		mongo_lib.addUser({
			"email": "test@mail.com"
		}, "password", function(success) {
			if (success) {
				done();
			}
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should return user == null when user is not in db", function(done) {
		var email = "not an email";
		var password = "password";
		mongo_lib.authenticateUser(email, password, function(err, result, user) {
			expect(user).toBeNull();
			done();
		});
	});

	it("should return user data when authentication succeeds", function(done) {
		var email = "test@mail.com";
		var password = "password";
		mongo_lib.authenticateUser(email, password, function(err, result, user) {
			expect(result).toBeTruthy();
			expect(user).not.toBeNull();
			//expect(user.email).toEqual(email);
			done();
		});
	});
});


describe("findUser", function() {

	beforeEach(function(done) {
		db.createCollection('users', function(err, collection) {
			// a collection
		});
		var users = db.collection('users');
		users.insert({
			"email": "test@mail.com"
		}, function(err, result) {
			if (err) throw err;
			done();
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should successfully find a user which is in the database", function(done) {
		var email = "test@mail.com";

		mongo_lib.findUser(email, function(err, user) {
			expect(user).not.toBeNull();
			expect(user.email).toBe("test@mail.com");
			done();
		});

	});

	it("should return null finding user not in db (user === null)", function(done) {
		var email = "anotheremail@mail.com";

		mongo_lib.findUser
		(email, function(err, user) {
			expect(user).toBeNull();
			done();
		});
	});


}); 