var mongodb = require('mongodb'),
	ObjectID = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient

var db;

var loadDB = function(database) {
	db = database;
};

// var saveBoard = function(boardName, boardData, callback) {
// 	var boards = db.collection('boards');

// 	boards.update({
// 		name: boardName
// 	}, {
// 		$push: {
// 			data: boardData
// 		}
// 	}, {
// 		safe: true,
// 		upsert: true
// 	},
// 	callback);
// };

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
		upsert: true
	},
	callback);
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

// var getBoard = function(boardName, callback) {
// 	var boards = db.collection('boards');
// 	boards.findOne({
// 		name: boardName
// 	}, 
// 	callback);
// };

var getBoard = function (boardID, callback) {
	var boards = db.collection('boards');
	boards.findOne({
		_id: boardID
	}, 
	callback);
};

var addUser = function (profile, callback) {
	var thirdPartyUsers = db.collection('thirdPartyUsers');
	var userDetails = {
		email: profile.emails[0].value,
		displayName: profile.displayName,
		boards: []
	};
	thirdPartyUsers.insert(userDetails, {}, callback);
};

var findUser = function (email, callback) {
	var thirdPartyUsers = db.collection('thirdPartyUsers');
	thirdPartyUsers.findOne({
		email: email
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
	var users = db.collection('thirdPartyUsers');
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
	var users = db.collection('thirdPartyUsers');
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
	var users = db.collection('thirdPartyUsers');
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
	var users = db.collection('thirdPartyUsers');
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
exports.clearBoard = clearBoard;
exports.createBoard = createBoard;
exports.addBoardToUser = addBoardToUser;
exports.getBoards = getBoards;
exports.fetchBoard = fetchBoard;
exports.getUsers = getUsers;
exports.addUsersToBoard = addUsersToBoard;
exports.addBoardToUsers = addBoardToUsers;
exports.getUsersByEmail = getUsersByEmail;
