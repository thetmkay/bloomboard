/*
 * Serve JSON to our AngularJS client
 */

var db;
var mongo_lib = require('./mongo_db_lib');

exports.setDbUrl = function(dbUrl) {
	db = require('mongoskin').db(dbUrl, {
		w: 1
	});
	mongo_lib.loadDB(db);
}

exports.name = function(req, res) {
	res.json({
		name: 'Bob'
	});
};

exports.saveBoard = function(req, res, callback) {
	mongo_lib.saveBoard(req.body.boardName, req.body.boardData, function(err, doc) {
		// done(err, doc);
	});
};

exports.getBoard = function(req, res) {
	// if (req.isAuthenticated()) {
	mongo_lib.getBoard("testBoard2", function(_info) {
		result = _info;
		res.json(result);
	});
	// } else {
	// res.send(401);
	// }
};

exports.clearBoard = function(req, res) {
	mongo_lib.clearBoard("testBoard2", function(_info) {
		result = _info;
		res.json(result);
	});
};

exports.login = function(email, password, done) {
	mongo_lib.authenticateUser(email, password, function(err, result, user) {
		if (result) {
			var userdata = {
				email: user.email,
			};
			done(err, userdata);
		} else {
			done(err, false);
		}
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.send(200);
};

exports.createUser = function(details, callback) {
	mongo_lib.addUser(details.user, details.password, callback);
};

exports.findUser = function(email, callback) {
	mongo_lib.findUser(email, function(err, user) {
		callback(err, user);
	});
};

exports.isActiveSession = function (req, res) {
	res.send(req.isAuthenticated()?200:401);
};

exports.getDisplayName = function(req, res) {
	if (req.isAuthenticated()) {
		res.json({
			displayName: req.user.displayName
		});
	} else {
		res.send(401);
	}
};


exports.getEmail = function(req, res) {
	if (req.isAuthenticated()) {
		res.json({
			email: req.user.email
		});
	} else {
		res.send(401);
	}
};

exports.createBoard = function (req, res) {
	var user = req.user;
	console.log(JSON.stringify(user, null, 4));
	mongo_lib.createBoard(req.body.newBoardName, user._id.toHexString(), function (err, records) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
			console.log(JSON.stringify(records, null, 2));
			mongo_lib.addBoardToUser(user._id, records[0]._id.toHexString(), function (err, doc){
				if (err) {
					console.error(JSON.stringify(err, null, 4));
					res.send(401);
				} else {
					res.send(200);
				}
			});
		}
	});
};

exports.getBoards = function (req, res) {
	var user = req.user;
	if (user.boards.length === 0) {
		res.json({boards: []});
	} else {
		mongo_lib.getBoards(user.boards, function (err, result) {
			
			if (err) {
				console.error(JSON.stringify(err, null, 4));
			}
			result.toArray(function (err, docs) {
				res.json({boards: docs});
			});
		});
	}
};