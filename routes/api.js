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
	mongo_lib.getBoard("testBoard2", function(err, _info) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
			result = _info;
			res.json(result);
		}
	});
	// } else {
	// res.send(401);
	// }
};

exports.clearBoard = function(req, res) {
	mongo_lib.clearBoard("testBoard2", function(err, doc) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
			res.send(200);
		}
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
				var boardsAccess = {
					read: [],
					write: []
				};
				idHex = user._id.toHexString();
				docs.forEach(function (elem) {
					if (elem.writeAccess.indexOf(idHex) !== -1) {
						boardsAccess.write.push({
							_id: elem._id.toHexString(),
							name: elem.name,
						});
					} else {
						boardsAccess.read.push({
							_id: elem._id.toHexString(),
							name: elem.name,
						});
					}
				});
				res.json({boards: boardsAccess});
			});
		});
	}
};

exports.fetchBoard = function (req, res) {
	mongo_lib.fetchBoard(req.body.boardID, function (err, board) {
		console.log(JSON.stringify(board, null, 4));
		boardAccess = {
			_id: board._id.toHexString(),
			name: board.name,
			read: [],
			write: []
		};
		mongo_lib.getUsers(board.writeAccess, function (err, cursor) {
			cursor.toArray(function (err, docs) {
				boardAccess.write = docs;
				mongo_lib.getUsers(board.readAccess, function (err, cursor2) {
					cursor2.toArray(function (err, docs2) {
						boardAccess.read = docs2;
						res.json({boardAccess: boardAccess});
					});
				})
			});
		});
	});
};

exports.addUsersAccess = function (req, res) {
	var data = req.body;
	mongo_lib.addBoardToUsers(data.emails.writeAccess.concat(data.emails.readAccess), data.boardID, function (err) {
		mongo_lib.getUsersByEmail(data.emails.writeAccess, function (err, cursor) {
	 		cursor.toArray(function (err2, docs) {
	 			var writeAccess = docs.map(function (value) {return value._id.toHexString()});
				mongo_lib.getUsersByEmail(data.emails.readAccess, function (err3, cursor2) {
					cursor2.toArray(function (err4, docs2) {
						var readAccess = docs2.map(function (value) {return value._id.toHexString()});
	 					mongo_lib.addUsersToBoard(data.boardID, writeAccess, 'writeAccess', function (err5) {
	 						mongo_lib.addUsersToBoard(data.boardID, readAccess, 'readAccess', function (err5) {
	 							res.send(200);
	 						});
	 					});
	 				});
	 			});
	 		});
	 	});
	});
};