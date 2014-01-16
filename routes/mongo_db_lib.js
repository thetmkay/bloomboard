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
		$set: {
			lastEdited: (new Date).getTime()
		},
		$push: {
			data: boardData
		}
	}, {
		safe: true,
		upsert: false
	}, callback);
};

var authClearBoard = function(boardID, caller, callback) {
	var boards = db.collection('boards');

	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
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

var findUser = function (username, callback) {
	var users = db.collection('users');
	users.findOne({
		username: username
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

var createBoard = function(creator, callback) {
	currentTime = (new Date).getTime();
	var board = {
		name: 'untitled',
		data: [],
		readAccess: [],
		writeAccess: [creator],
		creation: currentTime,
		lastEdited: currentTime,
		_public: false
	}
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
		readAccess:true,
		creation: true,
		lastEdited: true
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
		displayName : true,
		username: true
	},
	callback);
};

var addUsersToBoard = function (boardID, writeAccess, readAccess, callback) {
	var boards = db.collection('boards');
	var update = {};
	// update[access] = {
	// 	$each: userList
	// };
	boards.update({
		_id: boardID
	}, 
	{
		$addToSet: {
			writeAccess : {
				$each: writeAccess
			},
			readAccess : {
				$each: readAccess
			}
		}
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
		username: {
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

var getUsersByUsername = function (userList, callback) {
	var users = db.collection('users');
	users.find({
		username :{
			$in: userList
		}
	}, {}, 
	callback);
};

var deleteBoard = function (boardID, username, callback) {
	var boards = db.collection('boards');
	boards.findAndModify({
		_id: boardID,
		writeAccess: {
			$all: [username]
		}
	}, [], {}, {
		remove: true,
		upsert: false
	}, callback);
};

var removeBoardFromUsers = function(userList, boardID, callback) {
	var users = db.collection('users');
	users.update({
		username: {
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

var setUserDetails = function (userID, userDetails, callback) {
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

var authChangeAccess = function (boardID, caller, move, currentAccess, callback) {
	var boards = db.collection('boards');
	update = {};

	if (currentAccess === 'write') {
		update['$pull'] = {
			writeAccess: move
		};
		update['$addToSet'] = {
			readAccess: move
		};
	} else if (currentAccess === 'read') {
		update['$pull'] = {
			readAccess: move
		};
		update['$addToSet'] = {
			writeAccess: move
		};
	} else {
		callback({wrongAccess: true});
		return;
	}

	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
	}, update, {
		upsert: false,
		multi: false,
		safe: true
	}, callback);
};

var authRemoveAccess = function (boardID, caller, remove, callback) {
	var boards = db.collection('boards');
	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
	}, {
		$pull: {
			writeAccess: remove,
			readAccess: remove
		}
	}, {
		upsert: false,
		multi: false,
		safe: true
	}, callback);
};

var authChangeBoardName = function (boardID, caller, name, callback) {
	var boards = db.collection('boards');
	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
	}, {
		$set: {
			name: name
		}
	}, {
		upsert: false,
		multi: false,
		safe: true
	}, callback);
};

var createBoardWithDetails = function (boardName, read, write, _public, data, callback) {
  currentTime = (new Date).getTime();
  var board = {
		name: boardName,
		data: data,
		readAccess: read,
		writeAccess: write,
		creation: currentTime,
		lastEdited: currentTime,
		_public: _public
	};
	var boards = db.collection('boards');
	boards.insert(board, {safe: true}, callback);
};

var authSetPrivacy = function (boardID, caller, _public, callback) {
	var boards = db.collection('boards');
	
	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
	}, {
		$set: {
			_public: _public
		}
	}, {
		upsert: false,
		multi: false,
		safe: true
	}, callback);
};

var authDeletePaths = function (boardID, caller, paths, texts, callback) {
	var pathCriteria = [{path: {$in: paths}}];
	var totalCriteria = pathCriteria.concat(texts);
	var boards = db.collection('boards');
	boards.update({
		_id: boardID,
		writeAccess: {
			$all: [caller]
		}
	}, {
		$pull: {
			data: {
				$or : totalCriteria
			}
		}
	}, {
		upsert: false,
		multi: true,
		safe: true
	}, callback);
};
// var addBoardToUsersByID = function (userList, boardID, callback) {
// 	var users = db.collection('users');
// 	users.update({
// 		_id: {
// 			$in: userList
// 		}
// 	},{
// 		$addToSet: {
// 			boards: boardID
// 		}
// 	},
// 	{
// 		upsert: false,
// 		multi: true,
// 		safe: true
// 	}, 
// 	callback);
// };

exports.loadDB = loadDB;
exports.saveBoard = saveBoard;
exports.getBoard = getBoard;
exports.addUser = addUser;
exports.findUser = findUser;
exports.authClearBoard = authClearBoard;
exports.createBoard = createBoard;
exports.addBoardToUser = addBoardToUser;
exports.getBoards = getBoards;
exports.fetchBoard = fetchBoard;
exports.getUsers = getUsers;
exports.addUsersToBoard = addUsersToBoard;
exports.addBoardToUsers = addBoardToUsers;
exports.deleteBoard = deleteBoard;
exports.removeBoardFromUsers = removeBoardFromUsers;
exports.findIdentifier = findIdentifier;
exports.setUserDetails = setUserDetails;
exports.getUsersByUsername = getUsersByUsername;
exports.authChangeAccess = authChangeAccess;
exports.authRemoveAccess = authRemoveAccess;
exports.authChangeBoardName = authChangeBoardName;
exports.createBoardWithDetails = createBoardWithDetails;
// exports.addBoardToUsersByID = addBoardToUsersByID;
exports.authSetPrivacy = authSetPrivacy;
exports.authDeletePaths = authDeletePaths;