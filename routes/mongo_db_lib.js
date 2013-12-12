var mongodb = require('mongodb'),
	ObjectID = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient

var db;

var loadDB = function(database) {
	db = database;
};

var saveBoard = function(boardID, boardData, callback) {
	var boards = db.collection('boards');
	boards.update({
		_id: boardID
	}, {
		$push: {
			data: boardData
		}
	}, {
		safe: true,
		upsert: false
	},
	function(err, doc) {
		if (err) {
			console.error(err);
		}
		callback(err, doc);
	});
};

var clearBoard = function(boardID, callback) {
	var boards = db.collection('boards');

	boards.update({
		_id: boardID
	}, {
		$set: {
			data: []
		}
	}, {
		safe: true
	},
	callback);
};

var getBoard = function (boardID, callback) {
	var boards = db.collection('boards');
	boards.findOne({
		_id: boardID
	}, 
	callback);
};

var addUser = function (userdata, callback) {
	var users = db.collection('users');
	userdata['boards'] = []
	users.insert(userdata, {}, callback);
};

var findUser = function (email, callback) {
	var users = db.collection('users');
	users.findOne({
		email: email
	},
	callback);
};

var findIdentifier = function (identifier, callback) {
	var users = db.collection('users');
	users.findOne({
		identifier: identifier
	},
	callback);
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

var deleteBoard = function (boardID, userID, callback) {
	var boards = db.collection('boards');
	boards.findAndModify({
		_id: boardID,
		writeAccess: {
			$all: [userID]
		}
	}, [], {}, {
		remove: true,
		upsert: false
	}, callback);
};

var removeBoardFromUsers = function(userList, boardID, callback) {
	var users = db.collection('users');
	users.update({
		_id: {
			$in : userList
		}
	},{
		$pull : {
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

var setUsername = function (userID, userDetails, callback) {
	var users = db.collection('users');
	users.update({
		_id: userID
	}, {
		$set: userDetails
	}, {
		upsert: false,
		safe: true
	}, callback);
};

exports.loadDB = loadDB;
exports.saveBoard = saveBoard;
exports.getBoard = getBoard;
exports.addUser = addUser;
exports.findUser = findUser;
exports.clearBoard = clearBoard;
exports.createBoard = createBoard;
exports.addBoardToUser = addBoardToUser;
exports.getBoards = getBoards;
exports.fetchBoard = fetchBoard;
exports.getUsers = getUsers;
exports.addUsersToBoard = addUsersToBoard;
exports.addBoardToUsers = addBoardToUsers;
exports.getUsersByEmail = getUsersByEmail;
exports.deleteBoard = deleteBoard;
exports.removeBoardFromUsers = removeBoardFromUsers;
exports.findIdentifier = findIdentifier;
exports.setUsername = setUsername;