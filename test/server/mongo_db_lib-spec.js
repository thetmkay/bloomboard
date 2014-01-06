var db = require('mongoskin').db('mongodb://niket:kiwi@paulo.mongohq.com:10077/bloomboard-test', {
	w: 1
});
var mongo_lib = require('../../routes/mongo_db_lib');
var ObjectID = require('mongodb').ObjectID;

mongo_lib.loadDB(db);

describe("saveBoardData", function() {
	var testBoard2;

	beforeEach(function(done) {
		db.collection('boards').drop();

		db.createCollection('boards', function(err, collection) {

		});
		mongo_lib.createBoard("testBoard2", 1, function (err, doc) {
			testBoard2 = doc[0];
			done();
		});
	});

	afterEach(function() {
		db.collection('boards').drop();
	});

	it('should save regular without errors to the database', function(done) {
		var fakeBoardData = "checkDataValue21";
		
		mongo_lib.saveBoard(testBoard2._id, fakeBoardData, function(err, doc) {
			
			expect(err).toBeNull();

			db.collection('boards').findOne({
				_id: testBoard2._id
			}, function(err, doc2) {
				expect(err).toBeNull();
				expect(doc2).not.toBeNull();
				expect(doc2.data).toEqual([fakeBoardData]);
				done();
			});

		});
	});

	it('should save over an existing board without errors', function(done) {
		var fakeBoardData = {
			data: "checkDataValue21"
		};

		mongo_lib.saveBoard(testBoard2._id, fakeBoardData, function(err, doc) {
			expect(err == null).toBeTruthy();
			done();
		});


	});

});

describe("getBoardData", function() {
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

	var fakeBoardData2 = {
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

	var boards = [];

	beforeEach(function(done) {
		db.collection('boards').drop();

		db.createCollection('boards', function(err, collection) {

		});



		var fakeBoardData = "checkDataValue21";
		mongo_lib.createBoard('testBoard1', 1, function (err, b1) {
			boards.push(b1[0]);
			mongo_lib.saveBoard(b1[0]._id, fakeBoardData1, function(err, doc){
				mongo_lib.createBoard('testBoard2', 1, function (err, b2) {
					boards.push(b2[0]);
					mongo_lib.saveBoard(b2[0]._id, fakeBoardData1, function (err, doc) {
						mongo_lib.createBoard('testBoard3', 1, function (err, b3) {
							boards.push(b3[0]);
							mongo_lib.saveBoard(b3[0]._id, fakeBoardData1, function (err, doc) {
								mongo_lib.saveBoard(b3[0]._id, fakeBoardData2, function (err, doc) {
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	afterEach(function() {
		db.collection('boards').drop();
		boards = [];
	});

	it('should get one board that has once piece of data', function(done) {

		mongo_lib.getBoard(boards[0]._id, function(err, doc) {

			expect(err).toBeNull();
			expect(doc.data).toEqual([fakeBoardData1]);
			done();
		});
	});

	it('should get one board followed by a different one', function(done) {

		mongo_lib.getBoard(boards[0]._id, function(err, doc) {
			expect(err).toBeNull();
			expect(doc.data).toEqual([fakeBoardData1]);
			mongo_lib.getBoard(boards[1]._id, function(err2, doc2) {

				expect(err2).toBeNull();
				expect(doc2.data).toEqual([fakeBoardData2]);
				done();
			});
		});
	});

	it('should get one board that has multiple lines', function(done) {

		mongo_lib.getBoard(boards[2]._id, function(err, doc) {
			expect(err).toBeNull();
			expect(doc.data).toEqual([fakeBoardData2, fakeBoardData1]);
			done();
		});
	});



});

describe("clearBoardData", function() {
	var boards = [];

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

		mongo_lib.createBoard('testBoard1', 1, function (err, b1) {
			boards.push(b1[0]);
			mongo_lib.saveBoard(b1[0]._id, fakeBoardData1, function (err, doc) {
				mongo_lib.createBoard('testBoard2', 1, function (err, b2) {
					boards.push(b2[0]);
					mongo_lib.saveBoard(b2[0]._id, fakeBoardData1, function (err, doc) {
						done();
					});
				});
			});
		});
	});

	afterEach(function() {
		db.collection('boards').drop();
		boards = [];
	});

	it('should clear one board that has data', function(done) {

		mongo_lib.clearBoard(boards[0]._id, function(err, doc) {
			expect(err).toBeNull();
			expect(doc).toEqual(1);

			db.collection('boards').findOne({
				_id: boards[0]._id
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
			_id: boards[1]._id
		}, function(err1, doc1) {
			expect(err1).toBeNull();
			expect(doc1).not.toBeNull();

			mongo_lib.clearBoard(boards[0]._id, function(err, doc) {
				expect(err).toBeNull();
				expect(doc).toEqual(1);

				db.collection('boards').findOne({
					_id: boards[1]._id
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
		var userdata = {
			email: "secondtest@mail.com",
			displayName: "atest",
			username: "atest2"
		};
		db.collection('users').drop();
		db.createCollection('users', function(err, collection) {

		});

		db.collection('users').ensureIndex("username", {
			unique: true
		}, function(err, succ) {});

		mongo_lib.addUser(userdata, function(success) {
			done();
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should successfully add a user to the database with a hash", function(done) {
		var userdata = {
			email: "test@mail.com",
			displayName: "test",
			username: "atest"
		};

		mongo_lib.addUser(userdata, function(err, result) {
			expect(err).toBeNull();
			db.collection('users').findOne({
				email: userdata.email
			}, function(err, user) {
				expect(err).toBeNull();
				expect(user).not.toBeNull();
				expect(user.email).toMatch(userdata.email);
				done();
			});
		});
	});

	it("should return error if user is already added", function(done) {
		var userdata = {
			email: "secondtest@mail.com",
			displayName: "atest",
			username: "atest2"
		};

		mongo_lib.addUser(userdata, function(err) {
			expect(err).not.toBeNull();
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
			"email": "test@mail.com",
			"username": "test"
		}, function(err, result) {
			if (err) throw err;
			done();
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should successfully find a user which is in the database", function(done) {
		var username = "test";

		mongo_lib.findUser(username, function(err, user) {
			expect(user).not.toBeNull();
			expect(user.email).toBe("test@mail.com");
			done();
		});

	});

	it("should return null finding user not in db (user === null)", function(done) {
		var username = "test2";

		mongo_lib.findUser(username, function(err, user) {
			expect(user).toBeNull();
			done();
		});
	});


});

describe("findIdentifier", function() {

	beforeEach(function(done) {
		db.createCollection('users', function(err, collection) {
			// a collection
		});
		var users = db.collection('users');
		users.insert({
			email: 'test@mail.com',
			username: 'test',
			identifier: 'id1'
		}, function(err, result) {
			if (err) throw err;
			done();
		});
	});

	afterEach(function() {
		db.collection('users').drop();
	});

	it("should successfully find a user which is in the database", function(done) {
		var identifier = 'id1';

		mongo_lib.findIdentifier(identifier, function(err, user) {
			expect(user).not.toBeNull();
			expect(user.identifier).toBe('id1');
			done();
		});

	});

	it("should return null finding user not in db (user === null)", function(done) {
		var identifier = "id2";

		mongo_lib.findUser(identifier, function(err, user) {
			expect(user).toBeNull();
			done();
		});
	});
});


describe("createBoard", function() {
	beforeEach(function(done) {
		db.collection('boards').drop();
		db.createCollection('boards', function(err, collection) {
			done();
		});
	});

	afterEach(function() {
		db.collection('boards').drop();
	});

	it("should save the board and add userID to writeAccess array", function(done) {
		mongo_lib.createBoard('newBoard', 1, function(err, data) {
			expect(err).toBeNull();
			expect(data[0].name).toBe('newBoard');
			expect(data[0].writeAccess.indexOf(1)).not.toBe(-1);
			expect(data[0].readAccess).toEqual([]);
			done();
		});
	});
});

describe("addBoardToUser", function() {
	var users = [];
	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function(err, collection) {});
		mongo_lib.addUser({
			email: "test1@mail.com",
			displayName: 'name',
			username: 'test1'
		}, function (err, result) {
			users.push(result[0]);
			mongo_lib.addUser({
				email:  "test2@mail.com",
				displayName: 'name2',
				username: 'test2'
			}, function (err, result2) {
				users.push(result2[0]);
				done();		
			});
		});
	});

	afterEach(function() {
		db.collection('users').drop();
		users = [];
	});

	it("should add boardID to boards field in user", function(done) {
		mongo_lib.addBoardToUser(users[0]._id, 1, function (err, doc) {
			expect(err).toBeNull();
			mongo_lib.findUser(users[0].username, function (err2, userdata) {
				expect(err2).toBeNull();
				boardindex = userdata.boards.indexOf(1);
				expect(boardindex).not.toBe(-1);
				expect(userdata.boards.indexOf(1, boardindex + 1)).toBe(-1);
				done();	
			});
			
		});
	});

	it("shouldn't add boardID twice", function (done) {
		mongo_lib.addBoardToUser(users[0]._id, 1, function (err, doc) {
			expect(err).toBeNull();
			mongo_lib.addBoardToUser(users[0]._id, 1, function (err2, doc2) {
				expect(err2).toBeNull();
				mongo_lib.findUser(users[0].username, function (err3, userdata) {
					expect(err3).toBeNull();
					boardindex = userdata.boards.indexOf(1);
					expect(boardindex).not.toBe(-1);
					expect(userdata.boards.indexOf(1, boardindex + 1)).toBe(-1);
					done();
				});
			});
		});
	});

	it("shouldn't overwrite", function (done) {
		mongo_lib.addBoardToUser(users[0]._id, 1, function (err, doc) {
			expect(err).toBeNull();
			mongo_lib.addBoardToUser(users[0]._id, 2, function (err2, doc2) {
				expect(err2).toBeNull();
				mongo_lib.findUser(users[0].username, function (err3, userdata) {
					expect(err3).toBeNull();
					boardindex = userdata.boards.indexOf(1);
					expect(boardindex).not.toBe(-1);
					expect(userdata.boards.indexOf(1, boardindex + 1)).toBe(-1);
					boardindex = userdata.boards.indexOf(2);
					expect(boardindex).not.toBe(-1);
					expect(userdata.boards.indexOf(2, boardindex + 1)).toBe(-1);
					done();
				});
			});
		});
	});
});

describe("getBoards", function() {
	var boards = [];
	beforeEach(function(done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {
		});
		mongo_lib.createBoard('board1', 1, function (err, data) {
			boards.push(data[0]);
			mongo_lib.createBoard('board2', 1, function (err, data2) {
				boards.push(data2[0]);
				done();
			});
		});
	});

	afterEach(function() {
		db.collection('boards').drop();
		boards = [];
	});

	it("should retrieve all boards assigned to user", function(done) {
		var boardList = [boards[0]._id, boards[1]._id];
		mongo_lib.getBoards(boardList, function (err, cursor) {
			expect(err).toBeNull();
			cursor.toArray(function (err2, data) {
				expect(err2).toBeNull();
				expect(data.length).toBe(2);
				namelist = data.map(function (board) {
					return board.name;
				});
				expect(namelist.indexOf('board1')).not.toBe(-1);
				expect(namelist.indexOf('board2')).not.toBe(-1);
				done();
			});
		});
	});

});

describe("fetchBoard", function() {
	var boards = [];
	beforeEach(function (done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {
		});
		mongo_lib.createBoard('newBoard1', 1, function (err, data) {
			boards.push(data[0]);
			mongo_lib.createBoard('newBoard2', 1, function (err, data2) {
				boards.push(data2[0]);
				done();
			});
		});	
	});

	afterEach(function() {
		db.collection('boards').drop();
		boards = [];
	});

	it("should retrieve newBoard1", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, doc) {
			expect(err).toBeNull();
			expect(doc.hasOwnProperty('data')).toBeFalsy();
			expect(doc.name).toBe('newBoard1');
			done();
		});
	});
});

describe("getUsers", function (){
	var users = [];
	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function(err, collection) {
		});
		mongo_lib.addUser({
			username: 'test1'
		}, function (err, result) {
			users.push(result[0]);
			done();
		});
	});

	afterEach(function (){
		db.collection('users').drop();
		users = [];
	});


	it("should retrieve test1", function(done) {
		mongo_lib.getUsers([users[0]._id], function (err, cursor) {
			expect(err).toBeNull();
			cursor.toArray(function (err2, result) {
				expect(err2).toBeNull();
				expect(result.length).toEqual(1);
				expect(result[0].username).toEqual('test1');
				done();
			})
		});
	});

	it("shouldn't find anything", function(done) {
		var id1 = "000000000000000000000001";
		var id2 = "000000000000000000000002";
		if (users[0]._id.toHexString() == id1) {
			id1 = "000000000000000000000003"
		}
		if (users[0]._id.toHexString() == id2) {
			id2 = "000000000000000000000003"
		}
		mongo_lib.getUsers([ObjectID.createFromHexString(id1), ObjectID.createFromHexString(id2)], function (err, cursor) {
			expect(err).toBeNull();
			cursor.toArray(function (err2, result) {
				expect(err2).toBeNull();
				expect(result.length).toEqual(0);
				done();
			})
		});
	});

	it("should only retrieve certain users", function(done) {
		mongo_lib.addUser({
			username: 'test2'
		}, function (err, result) {
			expect(err).toBeNull();
			users.push(result[0]);
			mongo_lib.addUser({
				username: 'test3'
			}, function (err2, result2) {
				expect(err2).toBeNull();
				users.push(result2[0]);
				mongo_lib.getUsers([users[0]._id, users[2]._id], function (err3, cursor) {
					expect(err3).toBeNull();
					cursor.toArray(function (err4, docs) {
						expect(err4).toBeNull();
						expect(docs.length).toEqual(2);
						var ids = docs.map(function (elem) {
							return elem._id.toHexString();
						});
						expect(ids.indexOf(users[0]._id.toHexString())).not.toEqual(-1);
						expect(ids.indexOf(users[2]._id.toHexString())).not.toEqual(-1);
						done();
					});
				});
			});
		});
	});


});

describe("AddUsersToBoard", function () {
	var boards = [];

	beforeEach(function (done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {});
		mongo_lib.createBoard('board1', 0, function (err, result) {
			boards.push(result[0]._id);
			done();
		});
	});

	afterEach(function () {
		db.collection('boards').drop();
		boards = [];
	});

	it("should add users to respective fields", function (done) {
		var writeAccess = [1];
		var readAccess = [2];
		mongo_lib.addUsersToBoard(boards[0], writeAccess, readAccess, function (err, result) {
		  expect(err).toBeNull();
		 	mongo_lib.fetchBoard(boards[0], function (err2, result2) {
				expect(err2).toBeNull();
				expect(result2.writeAccess.length).toEqual(2);
				expect(result2.writeAccess.indexOf(0)).not.toEqual(-1);
				expect(result2.writeAccess.indexOf(1)).not.toEqual(-1);
				expect(result2.readAccess.length).toEqual(1);
				expect(result2.readAccess[0]).toBe(2);
				done();
			});
		});
	});

	it("shouldn't add the same value twice", function (done) {
		var writeAccess = [0];
		mongo_lib.addUsersToBoard(boards[0], writeAccess, [], function (err, result) {
			expect(err).toBeNull();
			mongo_lib.fetchBoard(boards[0], function (err2, result2) {
				expect(err2).toBeNull();
				expect(result2.writeAccess.length).toEqual(1);
				expect(result2.writeAccess[0]).toEqual(0);
				expect(result2.readAccess.length).toEqual(0);
				done();
			});
		});
	});

	it("shouldn't add duplicates in the arrays", function (done) {
		var writeAccess = [1, 1];
		var readAccess = [2, 2];
		mongo_lib.addUsersToBoard(boards[0], writeAccess, readAccess, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.fetchBoard(boards[0], function (err2, result2) {
				expect(err2).toBeNull();
				expect(result2.writeAccess.length).toBe(2);
				expect(result2.writeAccess.indexOf(0)).not.toEqual(-1);
				expect(result2.writeAccess.indexOf(1)).not.toEqual(-1);
				expect(result2.readAccess.length).toBe(1);
				expect(result2.readAccess[0]).toBe(2);
				done();
			});
		});
	});

});

describe("AddBoardToUsers", function () {
	var users = [];

	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function (err, collection) {});
		mongo_lib.addUser({
			username: 'test1'
		}, function (err, result) {
			users.push(result[0]);
			mongo_lib.addUser({
				username: 'test2'
			}, function (err2, result2) {
				users.push(result2[0]);
				mongo_lib.addUser({
					username: 'test3'
				}, function (err3, result3) {
					users.push(result3[0]);
					done();
				});
			});
		});
	});

	afterEach(function () {
		db.collection('users').drop();
		users = [];
	});

	it("should add boardID to userdata", function (done) {
		var testUsers = ['test1', 'test2'];
		mongo_lib.addBoardToUsers(testUsers, 1, function (err, result) {
		  expect(err).toBeNull();
		 	mongo_lib.getUsersByUsername(testUsers, function (err2, cursor2) {
		 		expect(err2).toBeNull();
		 		cursor2.toArray(function (err3, docs) {
		 			expect(err3).toBeNull();
		 			for (var i = 0; i < docs.length; i++) {
		 				expect(docs[i].boards.indexOf(1)).not.toEqual(-1);
		 			}
		 			mongo_lib.getUsersByUsername(['test3'], function (err4, cursor4) {
		 				expect(err4).toBeNull();
		 				cursor4.toArray(function (err5, docs2) {
		 					for (var j = 0; j < docs2.length; j++) {
		 						expect(docs2[j].boards.indexOf(1)).toEqual(-1);
		 					}
		 					done();
		 				});
		 			});
		 		});
		 	});
		});
	});

	it("shouldn't add the same board twice", function (done) {
		mongo_lib.addBoardToUsers(['test1'], 1, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.addBoardToUsers(['test1'], 1, function (err2, result2) {
				expect(err2).toBeNull();
				mongo_lib.getUsersByUsername(['test1'], function (err3, cursor) {
					expect(err3).toBeNull();
					cursor.toArray(function (err4, docs) {
						expect(err4).toBeNull();
						expect(docs[0].boards.length).toEqual(1);
						expect(docs[0].boards[0]).toEqual(1);
						done();
					});
				});
			});
		});
	});

});

describe("getUsersByUsername", function () {
	var users = [];

	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function (err, collection) {});
		mongo_lib.addUser({
			username: 'test1',
			email: 'test1@test.com'
		}, function (err, result) {
			users.push(result[0]);
			mongo_lib.addUser({
				username: 'test2',
				email: 'test2@test.com'
			}, function (err2, result2) {
				users.push(result2[0]);
				test1ID = users[0]._id.toHexString();
				mongo_lib.addUser({
					username: 'test3',
					email: 'test3@test.com'
				}, function (err3, result3) {
					users.push(result3[0]);
					done();
				});
			});
		});
	});

	afterEach(function () {
		db.collection('users').drop();
		users = [];
	});

	it("should retrieve only specified users", function (done) {
		var testUsers = ['test1', 'test2'];
		mongo_lib.getUsersByUsername(testUsers, function (err, cursor) {
		  expect(err).toBeNull();
		  cursor.toArray(function (err2, docs) {
		  	expect(err2).toBeNull();
		  	expect(docs.length).toEqual(2);
		  	var retrieved = docs.map(function (elem) {
		  		return elem.username;
		  	});
		  	expect(retrieved.indexOf('test1')).not.toEqual(-1);
		  	expect(retrieved.indexOf('test2')).not.toEqual(-1);
		  	done();
		  });
		});
	});
});

describe("deleteBoard", function () {

	var boards = [];

	beforeEach(function (done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {});
		mongo_lib.createBoard('board1', 1, function (err, result) {
			boards.push(result[0]);
			mongo_lib.createBoard('board2', 1, function (err, result2) {
				boards.push(result2[0]);
				done();
			});
		});
	});

	afterEach(function () {
		db.collection('boards').drop();
		boards = [];
	});

	it("should delete specified board", function (done) {
		mongo_lib.deleteBoard(boards[0]._id, 1, function (err, result) {
		  expect(err).toBeNull();
		  mongo_lib.fetchBoard(boards[0]._id, function (err2, result2) {
		  	expect(err2).toBeNull();
		  	expect(result2).toBeNull();
		  	mongo_lib.fetchBoard(boards[1]._id, function (err3, result3) {
		  		expect(err3).toBeNull();
		  		expect(result3).not.toBeNull();
		  		done();
		  	});
		  });
		});
	});
});

describe("removeBoardFromUsers", function () {
	var users = [];
	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function (err, collection) {});
		mongo_lib.addUser({username: 'test1'}, function (err, result) {
			users.push(result[0]);
			mongo_lib.addUser({username: 'test2'}, function (err, result2) {
				users.push(result2[0]);
				mongo_lib.addBoardToUsers(['test1', 'test2'], 1, function () {
					mongo_lib.addBoardToUsers(['test1'], 2, function () {
						done();
					});
				});
			});
		});
	});

	afterEach(function () {
		db.collection('users').drop();
		users = [];
	});

	it("should remove board from selected users", function (done) {
		var userlist = [users[0]._id];
		mongo_lib.removeBoardFromUsers(userlist, 1, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.findUser('test1', function (err2, test1) {
				expect(err2).toBeNull();
				expect(test1.boards.indexOf(1)).toEqual(-1);
				expect(test1.boards.indexOf(2)).not.toEqual(-1);
				mongo_lib.findUser('test2', function (err3, test2) {
					expect(err3).toBeNull();
					expect(test2.boards.indexOf(1)).not.toEqual(-1);
					done();
				});
			});
		});
	});

	it("should remove board from multiple users", function (done) {
		var userlist = [users[0]._id, users[1]._id];
		mongo_lib.removeBoardFromUsers(userlist, 1, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.findUser('test1', function (err2, test1) {
				expect(err2).toBeNull();
				expect(test1.boards.indexOf(1)).toEqual(-1);
				expect(test1.boards.indexOf(2)).not.toEqual(-1);
				mongo_lib.findUser('test2', function (err3, test2) {
					expect(err3).toBeNull();
					expect(test2.boards.indexOf(1)).toEqual(-1);
					done();
				});
			});
		});
	});
});

describe("setUserDetails", function () {
	var users = [];
	beforeEach(function (done) {
		db.collection('users').drop();
		db.createCollection('users', function (err, collection) {});
		mongo_lib.addUser({username: 'test1'}, function (err, result) {
			users.push(result[0]);
			mongo_lib.addUser({username: 'test2'}, function (err, result2) {
				users.push(result2[0]);
				done();
			});
		});
	});

	afterEach(function () {
		users = [];
		db.collection('users').drop();
	});

	it("should update the user details", function (done) {
		var updates = {
			email: 'test1@test.com',
			displayName: 'display'
		};
		mongo_lib.setUserDetails(users[0]._id, updates, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.findUser('test1', function (err2, test1) {
				expect(err2).toBeNull();
				expect(test1.email).toEqual('test1@test.com');
				expect(test1.displayName).toEqual('display');
				mongo_lib.findUser('test2', function (err3, test2) {
					expect(err3).toBeNull();
					expect(test2.email).not.toBeDefined();
					expect(test2.displayName).not.toBeDefined();
					done();
				});
			});
		});
	});

	it("should replace details added", function (done) {
		var updates = {
			email: 'test1@test.com',
			displayName: 'display'
		};
		mongo_lib.setUserDetails(users[0]._id, updates, function (err, result) {
			expect(err).toBeNull();
			mongo_lib.findUser('test1', function (err2, test1a) {
				expect(err2).toBeNull();
				expect(test1a.email).toEqual('test1@test.com');
				expect(test1a.displayName).toEqual('display');
				updates = {
					displayName: 'display2'
				};
				mongo_lib.setUserDetails(users[0]._id, updates, function (err3, result2) {
					expect(err3).toBeNull();
					mongo_lib.findUser('test1', function (err4, test1b) {
						expect(err4).toBeNull();
						expect(test1b.email).toEqual('test1@test.com');
						expect(test1b.displayName).toEqual('display2');
						done();
					});
				});
			});
		});
	});
});

describe("authChangeAccess", function () {
	var boards = [];

	beforeEach(function (done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {});
		mongo_lib.createBoard('board1', 1, function (err, result) {
			boards.push(result[0]);
			mongo_lib.addUsersToBoard(result[0]._id, [2], [3], function (err, result2) {
				done();
			});
		});
	});

	afterEach(function () {
		boards = [];
		db.collection('boards').drop();
	});

	it("should move user from writeAccess to readAccess", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, boardA) {
			expect(err).toBeNull();
			expect(boardA.writeAccess.indexOf(2)).not.toEqual(-1);
			expect(boardA.readAccess.indexOf(2)).toEqual(-1);
			mongo_lib.authChangeAccess(boards[0]._id, 1, 2, 'write', function (err2, result) {
				expect(err2).toBeNull();
				mongo_lib.fetchBoard(boards[0]._id, function (err3, boardB) {
					expect(err3).toBeNull();
					expect(boardB.writeAccess.indexOf(2)).toEqual(-1);
					expect(boardB.readAccess.indexOf(2)).not.toEqual(-1);
					done();
				});
			});
		});
	});

	it("should move user from readAccess to writeAccess", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, boardA) {
			expect(err).toBeNull();
			expect(boardA.writeAccess.indexOf(3)).toEqual(-1);
			expect(boardA.readAccess.indexOf(3)).not.toEqual(-1);
			mongo_lib.authChangeAccess(boards[0]._id, 1, 3, 'read', function (err2, result) {
				expect(err2).toBeNull();
				mongo_lib.fetchBoard(boards[0]._id, function (err3, boardB) {
					expect(err3).toBeNull();
					expect(boardB.writeAccess.indexOf(3)).not.toEqual(-1);
					expect(boardB.readAccess.indexOf(3)).toEqual(-1);
					done();
				});
			});
		});
	});

	it("shouldn't change data if current access isn't 'read' or 'write'", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, boardA) {
			expect(err).toBeNull();
			expect(boardA.writeAccess.indexOf(1)).not.toEqual(-1);
			expect(boardA.readAccess.indexOf(1)).toEqual(-1);
			expect(boardA.writeAccess.indexOf(2)).not.toEqual(-1);
			expect(boardA.readAccess.indexOf(2)).toEqual(-1);
			expect(boardA.writeAccess.indexOf(3)).toEqual(-1);
			expect(boardA.readAccess.indexOf(3)).not.toEqual(-1);
			mongo_lib.authChangeAccess(boards[0]._id, 1, 3, 'junk', function (err2) {
				expect(err2.wrongAccess).toBeTruthy();
				mongo_lib.fetchBoard(boards[0]._id, function (err3, boardB) {
					expect(err3).toBeNull();
					expect(boardB.writeAccess.indexOf(1)).not.toEqual(-1);
					expect(boardB.readAccess.indexOf(1)).toEqual(-1);
					expect(boardB.writeAccess.indexOf(2)).not.toEqual(-1);
					expect(boardB.readAccess.indexOf(2)).toEqual(-1);
					expect(boardB.writeAccess.indexOf(3)).toEqual(-1);
					expect(boardB.readAccess.indexOf(3)).not.toEqual(-1);
					done();
				});
			});
		});
	});
});

describe("authRemoveAccess", function () {
	var boards = [];

	beforeEach(function (done) {
		db.collection('boards').drop();
		db.createCollection('boards', function (err, collection) {});
		mongo_lib.createBoard('board1', 1, function (err, result) {
			boards.push(result[0]);
			mongo_lib.addUsersToBoard(result[0]._id, [2], [3], function (err, result2) {
				done();
			});
		});
	});

	afterEach(function () {
		boards = [];
		db.collection('boards').drop();
	});

	it("should remove the specified user from writeAccess", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, boardA) {
			expect(err).toBeNull();
			expect(boardA.writeAccess.indexOf(2)).not.toEqual(-1);
			mongo_lib.authRemoveAccess(boards[0]._id, 1, 2, function (err2, result) {
				expect(err2).toBeNull();
				mongo_lib.fetchBoard(boards[0]._id, function (err3, boardB) {
					expect(err3).toBeNull();
					expect(boardB.writeAccess.indexOf(2)).toEqual(-1);
					done();
				});
			});
		});
	});

	it("should remove the specified user from readAccess", function (done) {
		mongo_lib.fetchBoard(boards[0]._id, function (err, boardA) {
			expect(err).toBeNull();
			expect(boardA.readAccess.indexOf(3)).not.toEqual(-1);
			mongo_lib.authRemoveAccess(boards[0]._id, 1, 3, function (err2, result) {
				expect(err2).toBeNull();
				mongo_lib.fetchBoard(boards[0]._id, function (err3, boardB) {
					expect(err3).toBeNull();
					expect(boardB.readAccess.indexOf(3)).toEqual(-1);
					done();
				});
			});
		});
	});
});