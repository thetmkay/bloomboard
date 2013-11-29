var mongodb = require('mongodb'),
	ObjectID = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient,
	bcrypt = require('bcrypt-nodejs');

var db;

var loadDB = function(database) {
	db = database;
};

var saveBoard = function(boardName, boardData, callback) {
	var boards = db.collection('boards');

	boards.update({
		name: boardName
	}, {
		$push: {
			data: boardData
		}
	}, {
		safe: true,
		upsert: true
	},
	callback);
};

var clearBoard = function(boardName, callback) {
	var boards = db.collection('boards');

	boards.update({
		name: boardName
	}, {
		$set: {
			data: []
		}
	}, {
		safe: true
	},
	callback);
};

var getBoard = function(boardName, callback) {
	var boards = db.collection('boards');
	boards.findOne({
		name: boardName
	}, 
	callback);
};

     
var addUser = function(userDetails, password, callback) {
	var users = db.collection('users');
	bcrypt.hash(password, null, null, function(err, hash) {
		// add user to the database with hashed password
		userDetails['hash'] = hash;
		userDetails['boards'] = [];
		users.insert(userDetails, {}, function(err, user) {
			if (err) {
				console.warn(err.message);
				// most likely this email was already inserted in the database
				// console.log("user already added");
				callback(false);
			} else {
				callback(true);
			}
		});
	});
};

var findUser = function(email, callback) {
	var users = db.collection('users');
	users.findOne({
		"email": email
	}, function(err, user) {
		callback(err, user);
	});
};


var authenticateUser = function(email, password, callback) {
	// findUser from db
	findUser(email, function(err, user) {
		// console.log(JSON.stringify(user, null, 4));
		if (user) {
			bcrypt.compare(password, user.hash, function(err, result) {
				callback(err, result, user);
			});
		} else {
			callback(err, null, null);
		}
	});
};


var createBoard = function(boardName, creatorID, callback) {
	var board = {
		name: boardName,
		data: [],
		readAccess: [],
		writeAccess: [creatorID]
	};
	var boards = db.collection('boards');
	boards.insert(board, {safe: true}, callback);
};

var addBoardToUser = function(userID, boardID, callback) {
	var users = db.collection('users');
	users.update({
		_id: userID
	}, {
		$addToSet: {
			boards: boardID
		}
	}, {
		safe: true,
		upsert: false
	},
	callback);
};

var getBoards = function(boardList, callback) {
	var boards = db.collection('boards');
	boards.find({
		_id: {$in: boardList}
	}, 
	{
		_id: true, 
		name: true, 
		writeAccess:true, 
		readAccess:true
	}, 
	callback);
};

var fetchBoard = function(boardID, callback) {
	var boards = db.collection('boards');
	boards.findOne({
		_id: boardID
	}, 
	{
		_id: true, 
		name: true, 
		writeAccess:true, 
		readAccess:true
	}, 
	callback);
};

var getUsers = function(userList, callback) {
	var users = db.collection('users');
	users.find({
		_id: {$in: userList}
	}, 
	{ 
		email: true, 
		displayName : true
	}, 
	callback);
};

var addUsersToBoard = function (boardID, userList, access, callback) {
	var boards = db.collection('boards');
	var update = {};
	update[access] = {
		$each: userList
	};
	boards.update({
		_id: boardID
	}, 
	{
		$addToSet: update
	},
	{
		safe: true,
		upsert: false
	},
	callback);
};

var addBoardToUsers = function (userList, boardID, callback) {
	var users = db.collection('users');
	users.update({
		email: {
			$in: userList
		}
	},{
		$addToSet: {
			boards: boardID
		}
	},
	{
		upsert: false,
		multi: true,
		safe: true
	}, 
	callback);
};

var getUsersByEmail = function (userList, callback) {
	var users = db.collection('users');
	users.find({
		email :{
			$in: userList
		}
	}, {
		_id: true
	}, 
	callback);
};

exports.loadDB = loadDB;
exports.saveBoard = saveBoard;
exports.getBoard = getBoard;
exports.addUser = addUser;
exports.findUser = findUser;
exports.authenticateUser = authenticateUser;
exports.clearBoard = clearBoard;
exports.createBoard = createBoard;
exports.addBoardToUser = addBoardToUser;
exports.getBoards = getBoards;
exports.fetchBoard = fetchBoard;
exports.getUsers = getUsers;
exports.addUsersToBoard = addUsersToBoard;
exports.addBoardToUsers = addBoardToUsers;
exports.getUsersByEmail = getUsersByEmail;
