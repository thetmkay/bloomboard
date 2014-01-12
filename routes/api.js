/*
 * Serve JSON to our AngularJS client
 */

var db;
var mongo_lib = require('./mongo_db_lib');
var ObjectID = require('mongodb').ObjectID;
var emailer = require('./emailer');

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

exports.saveBoard = function (boardID, boardData, callback) {
	mongo_lib.saveBoard(ObjectID.createFromHexString(boardID), boardData, callback);
};

exports.clearBoard = function(req, res) {
	mongo_lib.clearBoard(ObjectID.createFromHexString(req.body.boardID), function(err, doc) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
			res.send(200);
		}
	});
};

exports.svg_png = function(req, callback) {
	exportBoard.svg_png(req, function(pngImage) {
		callback(pngImage);
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.send(200);
};

exports.createUser = function (userdata, callback) {
	mongo_lib.addUser(userdata, function (err, user) {
		if (userdata.email) {
			emailer.WelcomeEmail(userdata.email);
		}
		callback(err, user);	
	});

};

exports.findUser = function (username, callback) {
	mongo_lib.findUser(username, callback);
};

exports.findIdentifier = function (identifier, callback) {
	mongo_lib.findIdentifier(identifier, callback);
};

exports.isActiveSession = function (req, res) {
	res.send(req.isAuthenticated()?200:401);
};

exports.getDisplayName = function(req, res) {
	if (req.isAuthenticated()) {
		var user = req.user;
		var details = {
			_id: user._id.toHexString(),
			displayName: user.displayName
		};
		if (user.email) {
			details['email'] = user.email;
			emailer.WelcomeEmail(user.email);
		}
		if (user.username) {
			details['username'] = user.username;
		}
		res.json(details);
	} else {
		console.log('not authenticated');
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
	mongo_lib.createBoard(user.username, function (err, records) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
			console.log(JSON.stringify(records, null, 2));
			var boardID = records[0]._id.toHexString();
			mongo_lib.addBoardToUser(user._id, boardID, function (err, doc){
				if (err) {
					console.error(JSON.stringify(err, null, 4));
					res.send(401);
				} else {
					res.json({_id: boardID});
				}
			});
		}
	});
};

exports.getBoards = function (req, res) {
		var user = req.user;
		var boardsAccess = {
			read: [],
			write: []
		};

		if (!user) {
			res.send(401);
			return;
		}

		if (user.boards.length === 0) {
			res.json({boards: boardsAccess});
		} else {
			var boards = user.boards.map(ObjectID.createFromHexString);
			mongo_lib.getBoards(boards, function (err, result) {
				
				if (err) {
					console.error(JSON.stringify(err, null, 4));
				}
				result.toArray(function (err, docs) {
					docs.forEach(function (elem) {
						var board = {
							_id: elem._id.toHexString(),
							name: elem.name,
							creation: elem.creation,
							lastEdited: elem.lastEdited
						};
						if (elem.writeAccess.indexOf(user.username) !== -1) {
							boardsAccess.write.push(board);
						} else {
							boardsAccess.read.push(board);
						}
					});
					res.json({boards: boardsAccess});
				});
			});
		}
};

exports.fetchBoard = function (req, res) {
	console.log('LOG');
	var username = req.user.username;
	var boardID = ObjectID.createFromHexString(req.body.boardID);
	var hasAccess = false;
	mongo_lib.getBoard(boardID, function (err, board) {
		if (err) {
			res.json(401);
		} else {
			boardAccess = {
				_id: board._id.toHexString(),
				name: board.name,
				readAccess: [],
				writeAccess: [],
				canEdit: false
			};
			if (req.body.data) {
				boardAccess['data'] = board.data;
			}
			mongo_lib.getUsersByUsername(board.writeAccess, function (err, cursor) {
				cursor.toArray(function (err, docs) {
					boardAccess.writeAccess = docs.map(function (user) {
						if (user.username === username) {
							boardAccess.canEdit = true;
							hasAccess = true;
						}
						var newElem = user;
						delete newElem._id;
						return newElem;
					});
					mongo_lib.getUsersByUsername(board.readAccess, function (err, cursor2) {
						cursor2.toArray(function (err, docs2) {
							boardAccess.readAccess = docs2.map(function (user) {
								if (user.username === username) {
									hasAccess = true;
								}
								var newElem = user;
								delete newElem._id;
								return newElem;
							});
							if (hasAccess) {
								res.json({boardAccess: boardAccess});
							} else {
								res.send(401);
							}
						});
					})
				});
			});
		}
	});
};

exports.addUsersAccess = function (req, res) {
	var data = req.body;
	console.log(JSON.stringify(data, null, 4));
	var allUsers = data.usernames.writeAccess.concat(data.usernames.readAccess);
	mongo_lib.addBoardToUsers(allUsers, data.boardID, function (err) {
		mongo_lib.getUsersByUsername(data.usernames.writeAccess, function (err, cursor) {
	 		cursor.toArray(function (err2, docs) {
	 			var writeAccess = docs.map(function (value) {return value.username});
				mongo_lib.getUsersByUsername(data.usernames.readAccess, function (err3, cursor2) {
					cursor2.toArray(function (err4, docs2) {
						var readAccess = docs2.map(function (value) {return value.username});
						var boardID = ObjectID.createFromHexString(data.boardID);
	 					mongo_lib.addUsersToBoard(boardID, writeAccess, readAccess, function (err5) {
							var users = docs.concat(docs2);	
							for (var i = 0; i < users.length; i++) {
								emailer.AddEmail(users[i].email);
							}	 						
							res.send(200);
	 					});
	 				});
	 			});
	 		});
	 	});
	});
};

exports.deleteBoard = function (req, res) {
	var boardID = req.body.boardID;
	var user = req.user;
	mongo_lib.deleteBoard(ObjectID.createFromHexString(boardID), user.username, function (err, result) {
		console.log(JSON.stringify(result, null, 4));
		if (result) {
			var users = result.readAccess.concat(result.writeAccess);
			mongo_lib.removeBoardFromUsers(users, boardID, function (err2, result2) {
				mongo_lib.getUsersByUsername(users, function (err3, cursor) {
					cursor.toArray(function (err4, result) {
						for (var i = 0; i < result.length; i++) {
							emailer.DeleteEmail(result[i].email);
						}	 						
						res.send(200);
					});				
				});				
			});
			res.send(200);
		} else {
			res.send(401);
		}
	});
};

exports.authCallback = function (req, res) {
	mongo_lib.findIdentifier(req.user, function(err, user) {
		if (user.username.slice(-1) == '#') {
			res.redirect('/newUser');
		} else {
			res.redirect('/boards');
		}
	});
};

exports.setUsername = function (req, res) {
	var user = req.user;
	var userDetails = {
		username: req.body.username
	};
	if (req.body.email) {
		userDetails.email = req.body.email;
	}
	mongo_lib.setUserDetails(user._id, userDetails, function (err, result) {
		if (err) {
			res.send(401);
		} else {
			res.send(200);	
		}
		
	});
};

exports.sktGetWriteAccess = function (boardID, username, callback) {
	mongo_lib.fetchBoard(ObjectID.createFromHexString(boardID), function (err, result) {
		if (result.writeAccess.indexOf(username) !== -1) {
			callback(true);
		} else {
			callback(false);
		}
	});
};

exports.switchAccess = function (req, res) {
	var user = req.user;
	if (user.username === req.body.username) {
		res.send(401);
	} else {
		mongo_lib.findUser(req.body.username, function(err, move) {
			mongo_lib.authChangeAccess(ObjectID.createFromHexString(req.body.boardID), user.username, move.username, req.body.currentAccess, function (err, result) {
				if (err) {
					if (err.wrongAccess) {
						res.send(401);
						return;
					}
				}
				res.send(200);
			});	
		}); 
	}
};

exports.removeAccess = function (req, res) {
	var user = req.user;
	if (user.username === req.body.username) {
		res.send(401);
	} else {
		mongo_lib.findUser(req.body.username, function (err, remove) {
			mongo_lib.authRemoveAccess(ObjectID.createFromHexString(req.body.boardID), user.username, remove.username, function (err, result) {
				if (result === 1) {
					mongo_lib.removeBoardFromUsers([remove.username], req.body.boardID, function(err, result2) {
						res.send(200);
					});
				} else {
					res.send(401);
				}				
			});
		});
	}
};

exports.changeBoardName = function (boardID, username, newName, callback) {
	mongo_lib.authChangeBoardName(ObjectID.createFromHexString(boardID), username, newName, function (err, result) {
		if (err) {
			callback(false);
		} else {
			callback(true);
		}
	});
};

exports.duplicateBoard = function (req, res) {
	mongo_lib.fetchBoard(ObjectID.createFromHexString(req.body.boardID), function (err, result) {
		if (err) {
			res.send(401);
			return;
		}
		mongo_lib.createBoardWithDetails(result[0].name, result[0].readAccess, result[0].writeAccess, function (err, board) {
			var boardID = board[0]._id.toHexString();
			var users = result[0].readAccess.concat(result[0].writeAccess);
			mongo_lib.addBoardToUsers(users, boardID, function (err, result) {
				if (err) {
					res.send(401);
				} else {
					res.send(200);
				}
			});
		});
	});
};

exports.sktGetBoard = function (boardID, callback) {
	mongo_lib.fetchBoard(ObjectID.createFromHexString(boardID), function (err, board) {
		callback(board);
	});
};
