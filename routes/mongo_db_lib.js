var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	bcrypt = require('bcrypt');

var saveBoard = function(boardData) {

	MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
		var collection = db.collection('boards');
		collection.update({
				name: "testBoard2"
			}, {
				$set: {
					Data: boardData
				}
			}, {
				safe: true
			},
			function(err, doc) {
				if (err) {
					console.error(err);
				}
				collection.find({}).toArray(function(err, docs) {
					if (err) {
						console.error(err);
					}
					docs.forEach(function(doc) {})
				})
			})

	})
};

var getBoard = function(boardName, callback) {
	MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
		var collection = db.collection('boards');
		collection.findOne({
			name: "testBoard2"
		}, function(err, doc) {
			if (err) {
				console.error(err);
			}
			callback(doc);
		})
	})
};

var addUser = function(userDetails, password, callback) {
	MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
		var users = db.collection('users');
		bcrypt.hash(password, 10, function(err, hash) {
			// add user to the database with hashed password
			userDetails['hash'] = hash;
			users.insert(userDetails, {}, function(err, objects) {
				if (err) {
					console.warn(err.message);
				} else if (err && err.message.indexOf('E11000 ') !== -1) {
					// this _id was already inserted in the database
					console.log("user already added");
					callback(false);
				} else {
					callback(true);
				}
			});
		});
	});
};

var findUser = function(email, callback) {
	MongoClient.connect("mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387", function(err, db) {
		var users = db.collection('users');
		users.findOne({
			"email": email
		}, function(err, user) {
			if (err) {
				console.error(err);
			}
			callback(user);
		});
	});
};


var authenticateUser = function(email, password, callback) {
	// findUser from db
	var user = findUser(email, function(user) {
		if (user) {
			bcrypt.compare(password, user.hash, function(err, result) {
				if (result) {
					callback(true, user);
				} else {
					callback(false);
				}
			});
		} else {
			callback(false);
		}
	});
};

exports.saveBoard = saveBoard;
exports.getBoard = getBoard;
exports.addUser = addUser;
exports.findUser = findUser;
exports.authenticateUser = authenticateUser;