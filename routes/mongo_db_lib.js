var mongodb = require('mongodb'),
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
		safe: true
	},
	function(err, doc) {
		if (err) {
			console.error(err);
		}

		callback(err, doc);
	})
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
		safe: false
	},
	function(err, doc) {
		if (err) {
			console.error(err);
		}

		callback(err, doc);
	})
};

var getBoard = function(boardName, callback) {
	var boards = db.collection('boards');
	boards.findOne({
		name: boardName
	}, function(err, doc) {
		if (err) {
			console.error(err);
		}
		callback(doc);
	})
};

var addUser = function(userDetails, password, callback) {
	var users = db.collection('users');
	bcrypt.hash(password, null, null, function(err, hash) {
		// add user to the database with hashed password
		userDetails['hash'] = hash;
		users.insert(userDetails, {}, function(err, user) {
			if (err) {
				console.warn(err.message);
				// most likely this email was already inserted in the database
				console.log("user already added");
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
		console.log(JSON.stringify(user, null, 4));
		if (user) {
			bcrypt.compare(password, user.hash, function(err, result) {
				callback(err, result, user);
			});
		} else {
			callback(err, null, null);
		}
	});
};

exports.loadDB = loadDB;
exports.saveBoard = saveBoard;
exports.getBoard = getBoard;
exports.addUser = addUser;
exports.findUser = findUser;
exports.authenticateUser = authenticateUser;
exports.clearBoard = clearBoard;