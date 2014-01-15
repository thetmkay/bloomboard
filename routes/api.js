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
			displayName: user.displayName,
			username: null
		};
		if (user.email) {
			details['email'] = user.email;
		}
		if (user.username.slice(-1) !== '#') {
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
	console.log(user.username.slice(-1));
	if (user.username.slice(-1) == '#') {
		res.redirect('/newUser');
		return;
	}
	mongo_lib.createBoard(user.username, function (err, records) {
		if (err) {
			console.error(JSON.stringify(err, null, 4));
			res.send(401);
		} else {
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
			if (req.body.email) {
				emailer.WelcomeEmail(req.body.email);
			}
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
		console.log(JSON.stringify(result));
		var newBoardName = result.name + '_duplicate';
		mongo_lib.createBoardWithDetails(newBoardName, result.readAccess, result.writeAccess, result._public, function (err, board) {
			console.log(JSON.stringify(board, null, 4));
			var boardID = board[0]._id.toHexString();
			var users = board[0].readAccess.concat(board[0].writeAccess);
			console.log(users);
			mongo_lib.addBoardToUsers(users, boardID, function (err, result) {
				if (err) {
					res.send(401);
				} else {
					res.json({
						boardID: boardID,
						boardName: newBoardName
					});
				}
			});
		});
	});
};

exports.sktGetBoard = function (boardID, callback) {
	mongo_lib.getBoard(ObjectID.createFromHexString(boardID), function (err, board) {
		callback(board);
	});
};

exports.sktRefreshBoard = function (board, callback) {
	var users = function (retrievedBoard) {

		var mapper = function (user) {
			return {
				username: user.username,
				email: user.email
			};
		}

		var boardAccess = {
			_id: retrievedBoard._id.toHexString(),
			name: retrievedBoard.name,
			readAccess: [],
			writeAccess: [],
			_public: retrievedBoard._public
		};
		mongo_lib.getUsersByUsername(retrievedBoard.writeAccess, function (err, cursor) {
			cursor.toArray(function (err, docs) {
				boardAccess.writeAccess = docs.map(mapper);
				mongo_lib.getUsersByUsername(retrievedBoard.readAccess, function (err, cursor2) {
					cursor2.toArray(function (err, docs2) {
						boardAccess.readAccess = docs2.map(mapper);
						callback(boardAccess, retrievedBoard.writeAccess, retrievedBoard.readAccess);
					});
				})
			});
		});
	};

	if (board.name) {
		users(board);
	} else {
		mongo_lib.getBoard(ObjectID.createFromHexString(board), function (err, board_found) {
			if (err) {
				callback(false);
			} else {
				users(board_found);
			}
		});
	}
};

exports.sktAddUsersAccess = function (boardID, read, write, callback) {
	var allUsers = write.concat(read);
	mongo_lib.addBoardToUsers(allUsers, boardID, function (err) {
		mongo_lib.getUsersByUsername(write, function (err, cursor) {
	 		cursor.toArray(function (err2, docs) {
	 			var writeAccess = docs.map(function (value) {return value.username});
				mongo_lib.getUsersByUsername(read, function (err3, cursor2) {
					cursor2.toArray(function (err4, docs2) {
						var readAccess = docs2.map(function (value) {return value.username});
						var boardIDObj = ObjectID.createFromHexString(boardID);
	 					mongo_lib.addUsersToBoard(boardIDObj, writeAccess, readAccess, function (err5) {
	 						callback();
	 					});
	 				});
	 			});
	 		});
	 	});
	});
};

exports.sktSwitchAccess = function (username, caller, currentAccess, boardID, callback) {
	mongo_lib.findUser(username, function(err, move) {
		mongo_lib.authChangeAccess(ObjectID.createFromHexString(boardID), caller, move.username, currentAccess, function (err, result) {
			if (!err) {
				callback();
			}
		});	
	}); 
};

exports.sktRemoveAccess = function (username, caller, boardID, callback) {
	mongo_lib.findUser(username, function (err, remove) {
		mongo_lib.authRemoveAccess(ObjectID.createFromHexString(boardID), caller, remove.username, function (err, result) {
			if (result === 1) {
				mongo_lib.removeBoardFromUsers([remove.username], boardID, function(err, result2) {
					callback();
				});
			}
		});
	});
};

exports.sktDeleteBoard = function (boardID, username, callback) {
	mongo_lib.deleteBoard(ObjectID.createFromHexString(boardID), username, function (err, result) {
		if (result) {
			var users = result.readAccess.concat(result.writeAccess);
			mongo_lib.removeBoardFromUsers(users, boardID, function (err2, result2) {
				

				mongo_lib.getUsersByUsername(users, function (err3, cursor) {
					cursor.toArray(function (err4, result) {
						for (var i = 0; i < result.length; i++) {
							emailer.DeleteEmail(result[i].email);
						}	 						
					});				
				});			
				callback();
			});
		}
	});
};

exports.sktSetPrivacy = function (boardID, username, _public, callback) {
	mongo_lib.authSetPrivacy(ObjectID.createFromHexString(boardID), username, _public, function (err, result) {
		if (!(err || result === 0)) {
			callback();
		}
	});
};

exports.sktDeletePaths = function (boardID, username, paths, callback) {
	mongo_lib.authDeletePaths(ObjectID.createFromHexString(boardID), username, paths, function (err, result) {
		callback(!(err || result === 0));
	});
};

exports.sktClearBoard = function (boardID, username, callback) {
	mongo_lib.authClearBoard(ObjectID.createFromHexString(boardID), username, function (err, result) {
		if (!(err || result === 0)) {
			callback();
		}
	});
};