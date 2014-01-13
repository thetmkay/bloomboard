'use strict';

var api = require('./api');
var Cereal = require('cereal');
var util = require('util');

var penID = 0;

function nextPenID() {
	penID += 1;
	return penID;
};

var con_pens = [];

var io = null;

var addToSet = function (set, elem) {
	if (set.indexOf(elem) === -1) {
		set.push(elem);
	}
	return set;
};

var getUsersOnBoard = function (board, username, callback) {
	var handshaken = io.handshaken;
	var boardID = board._id.toHexString();
	var onBoard = io.sockets.clients(boardID).map(function (elem) {
		return handshaken[elem.id].user.username;
	});
	var users = {
		read: {},
		write: {}
	};
	for (var i = 0; i < onBoard.length; i++) {
		if (onBoard[i] !== username) {
			if (board.writeAccess.indexOf(onBoard[i]) !== -1) {
				if (users.write[onBoard[i]]) {
					++users.write[onBoard[i]].instances;
				} else {
					users.write[onBoard[i]] = {
						instances: 1,
						writing: false
					};
				}
			} else {
				if (users.read[onBoard[i]]) {
					++users.read[onBoard[i]].instances;
				} else {
					users.read[onBoard[i]] = {
						instances: 1
					};
				}
			}
		}
	}
	callback(users);
};

exports.setIO = function(_io) {
	io = _io;
};

var initialise_writing = function (socket, boardID, user) {
	socket.on('draw', function(json) {
		api.saveBoard(boardID, json, function (err, doc) {
		});
		socket.broadcast.to(boardID).emit('update_sketch', json);
	});

	socket.on('s_con_mouse_down', function(data) {
		socket.broadcast.to(boardID).emit('con_mouse_down', data);
		socket.broadcast.to(boardID).emit('editing', {
			user: user.username
		});
	});

	socket.on('s_con_mouse_move', function(data) {
		socket.broadcast.to(boardID).emit('con_mouse_move', data);
		
	});

	socket.on('s_con_mouse_up', function(data) {
		socket.broadcast.to(boardID).emit('con_mouse_up', data);
		socket.broadcast.to(boardID).emit('not_editing', {
			user: user.username
		});
	});

	socket.on('s_clearBoard', function(data) {
		socket.broadcast.to(boardID).emit('clearBoard', {});
	});

	socket.on('new_board_name', function (data) {
		api.changeBoardName(boardID, user.username, data.newBoardName, function (success) {
			if (success) {	
				socket.broadcast.to(boardID).emit('change_board_name', data.newBoardName);
				socket.emit('change_board_name', data.newBoardName);
			}
		});
	});

	socket.on('new_access', function (data) {
		api.sktAddUsersAccess(boardID, data.usernames.readAccess, data.usernames.writeAccess, function () {
			api.sktRefreshBoard(boardID, function (boardAccess) {
				socket.emit('refreshEdit', boardAccess);
				socket.broadcast.to(boardID).emit('refreshEdit', boardAccess);
			});
		});
	});

	socket.on('switch_access', function (data) {
		if (user.username !== data.username) {
			api.sktSwitchAccess(data.username, user.username, data.currentAccess, boardID, function (err, result) {
				if (!err) {
					api.sktRefreshBoard(boardID, function (boardAccess) {
						var sockets = io.sockets.clients(boardID);
						for (var i = 0; i < sockets.length; i++) {
							sockets[i].get('switch_access', function (err, fn) {
								fn(data.username, data.currentAccess !== 'write', boardAccess);
							});
						}
					});
				}
			});
		}
	});

	socket.on('remove_access', function (data) {
		if (user.username !== data.username) {
			api.sktRemoveAccess(data.username, user.username, boardID, function (err, result) {
				if (!err) {
					api.sktRefreshBoard(boardID, function (boardAccess) {
						var sockets = io.sockets.clients(boardID);
						for (var i = 0; i < sockets.length; i++) {
							sockets[i].get('remove_access', function (err, fn) {
								fn(data.username, boardAccess);
							});
						}
					});
				}
			});
		}
	});

	socket.on('delete_board', function (data) {
		console.log('a');
		api.sktDeleteBoard(boardID, user.username, function (err, result) {
			if (!err) {
				var sockets = io.sockets.clients(boardID);
				for (var i = 0; i < sockets.length; i++) {
					sockets[i].get('delete_board', function (err, fn) {
						fn();
					});
				}
			}
		});
	});
};

var releaseListeners = function (socket) {
	socket.removeAllListeners('draw');
	socket.removeAllListeners('s_con_mouse_down');
	socket.removeAllListeners('s_con_mouse_move');
	socket.removeAllListeners('s_con_mouse_up');
	socket.removeAllListeners('s_clearBoard');
	socket.removeAllListeners('new_board_name');
	socket.removeAllListeners('new_access');
	socket.removeAllListeners('delete_board');
	socket.removeAllListeners('switch_access');
	socket.removeAllListeners('remove_access');

};

var initializeEditResponse = function (socket, boardID) {
	
};

exports.newSocket = function (socket) {

	var boardID = null;
	var user = null;
	var canEdit = false;




	socket.on('joinBoard', function (_boardID) {

		boardID = _boardID;
		user = socket.manager.handshaken[socket.id].user;

		api.sktGetBoard(boardID, function (board) {
			canEdit = board.writeAccess.indexOf(user.username) != -1;
			if (canEdit) {
				initialise_writing(socket, boardID, user);
			}
			api.sktRefreshBoard(board, function (boardAccess) {
				boardAccess.canEdit = canEdit;
				socket.emit('refreshEdit', boardAccess);
			});
			getUsersOnBoard(board, user.username, function (users) {
				socket.emit('live_users', users);
			});


			var newUserdata = {
				user: user.username
			}
			newUserdata.type = canEdit? 'editors': 'followers';

			socket.broadcast.to(boardID).emit('new_live_user', newUserdata);
			

			socket.join(boardID);
			// console.log('}}}' + util.inspect(socket, {showHidden:false, depth: 3, colors: true}));
		});	
		
	});

	socket.on('s_con_pen_color_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_color_change', data);
	});

	socket.on('s_new_con_user', function(data) {
		con_pens.push(Cereal.parse(data.pen));
		
		var userPenID = con_pens.length - 1;
		data.id = userPenID;
		data.user = {
			username: user.username
		};
		
		socket.emit('penID', userPenID);
		
		socket.emit('concurrent_users', {
			con_pens: con_pens
		});
		socket.broadcast.to(boardID).emit('new_con_user', data);

	});

	socket.on('leaveBoard', function () {
		if (boardID) {
			var userdata = {
				user: user.username
			}
			userdata.type = canEdit? 'editors': 'followers';
			socket.broadcast.to(boardID).emit('leaving_user', userdata);
			socket.leave(boardID);
		}
		boardID = null;
		canEdit = false;
		releaseListeners(socket);
		
	});

	socket.on('remove_change_name', function () {
		socket.removeAllListeners('new_board_name');
	});

	socket.on('disconnect', function () {
		if (boardID) {
			socket.broadcast.to(boardID).emit('leaving_user', {
				username: user.username,

			});
		}
	});

	socket.set('switch_access', function (username, write, boardAccess) {
		if (username === user.username) {
			canEdit = write;
			boardAccess.canEdit = write;

			if (write) {
				initialise_writing(socket, boardID, user);
				socket.emit('activate_board');
			} else {
				releaseListeners(socket);
				socket.emit('lock_board');
			}
		} else {
			
			var type = write? 'editors' : 'followers';
			socket.emit('live_switch', {username: username, type: type});
		}
		boardAccess.canEdit = canEdit;
		socket.emit('refreshEdit', boardAccess);
	});

	socket.set('remove_access', function (username, boardAccess) {
		if (username === user.username) {
			releaseListeners(socket);
			socket.leave(boardID);
			socket.emit('deleted');
		} else {
			var type = canEdit? 'editors' : 'followers';
			socket.emit('deleted_live_user', {username: username, type: type});
			boardAccess.canEdit = canEdit;
			socket.emit('refreshEdit', boardAccess);
		}
	});

	socket.set('delete_board', function () {
		releaseListeners(socket);
		socket.leave(boardID);
		socket.emit('board_deleted');
	});

	
};