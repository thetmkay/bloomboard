var db = require('mongoskin').db('mongodb://niket:kiwi@paulo.mongohq.com:10077/bloomboard-test', {
	w: 1
});
var mongo_lib = require('../../routes/mongo_db_lib');


mongo_lib.loadDB(db);

describe("saveBoardData", function() {
	beforeEach(function(done) {
		db.collection('boards').drop();

		db.createCollection('boards', function(err, collection) {

		});
		done();
	});

	afterEach(function() {
		db.collection('boards').drop();
	});

	it('should save regular without errors to the database', function(done) {
		var fakeBoardData = "checkDataValue21";

		mongo_lib.saveBoard("testBoard2", fakeBoardData, function(err, doc) {
			expect(err).toBeNull();

			db.collection('boards').findOne({
				name: "testBoard2"
			}, function(err, doc) {
				expect(err).toBeNull();
				expect(doc).not.toBeNull();
				console.log("intest: " + JSON.stringify(doc));
				expect(doc.data).toEqual([fakeBoardData]);
				done();
			});

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

describe("clearBoardData", function() {
	beforeEach(function(done) {
		db.collection('boards').drop();

		db.createCollection('boards', function(err, collection) {

		});

		var fakeBoardData1 = {
			"fill": "none",
			"stroke": "#000000",
			"path": "M149,45L150,45L152,47L155,50L165,54L167,55L168,55L171,56L172,56L177,56L181,56L187,55L197,53L199,53L212,49L212,48L213,48L217,46L218,45L219,44",
			"stroke-opacity": 1,
			"stroke-width": 5,
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
			"transform": [],
			"type": "path"
		};
		var fakeBoardData = "checkDataValue21";

		mongo_lib.saveBoard("testBoard1", fakeBoardData1, function(err, doc) {

		});

		mongo_lib.saveBoard("testBoard2", fakeBoardData1, function(err, doc) {

		});

		done();
	});

	afterEach(function() {
		db.collection('boards').drop();
	});

	it('should clear one board that has data', function(done) {

		mongo_lib.clearBoard("testBoard1", function(err, doc) {
			expect(err).toBeNull();
			expect(doc).toEqual(1);

			db.collection('boards').findOne({
				name: "testBoard1"
			}, function(err1, doc1) {
				expect(err1).toBeNull();
				expect(doc1).not.toBeNull();
				expect(doc1.data.length).toEqual(0);
				done();
			});
		});
	});

	it('should clear not affect other board\'s data', function(done) {

		db.collection('boards').findOne({
			name: "testBoard2"
		}, function(err1, doc1) {
			expect(err1).toBeNull();
			expect(doc1).not.toBeNull();

			mongo_lib.clearBoard("testBoard1", function(err, doc) {
				expect(err).toBeNull();
				expect(doc).toEqual(1);

				db.collection('boards').findOne({
					name: "testBoard2"
				}, function(err2, doc2) {
					expect(err2).toBeNull();
					expect(doc2).not.toBeNull();
					expect(doc2).toEqual(doc1);
					done();
				});
			});

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

		db.collection('users').ensureIndex("email", {
			unique: true
		}, function(err, succ) {});

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
			expect(user.email).toEqual(email);
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

		mongo_lib.findUser(email, function(err, user) {
			expect(user).toBeNull();
			done();
		});
	});


});