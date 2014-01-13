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

var test = function (data) {
	console.log('a')
	console.log(data);
};

var io = null;

var addToSet = function (set, elem) {
	if (set.indexOf(elem) === -1) {
		set.push(elem);
	}
	return set;
};

var getUsersOnBoard = function (boardID, username, callback) {
	var handshaken = io.handshaken;
	var onBoard = io.sockets.clients(boardID).map(function (elem) {
		return handshaken[elem.id].user.username;
	});

	api.sktGetBoard(boardID, function (board) {
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
	});


};

exports.setIO = function(_io) {
	io = _io;
};

exports.newSocket = function (socket) {

	var boardID = null;
	var user = null;
	var canEdit = false;

	socket.on('joinBoard', function (_boardID) {

		console.log('---ID: '+ socket.id);
		console.log('---User: ' + JSON.stringify(socket.manager.handshaken[socket.id].user, null, 4));
		//console.log(util.inspect(socket, {showHidden: false, depth: 5, colors: true}));

		boardID = _boardID;
		user = socket.manager.handshaken[socket.id].user;


		api.sktGetWriteAccess(boardID, user.username, function (edit) {
			if (edit) {
				canEdit = edit;
				
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
					console.log('change name');
					api.changeBoardName(boardID, user.username, data.newBoardName, function (success) {
						if (success) {	
							socket.broadcast.to(boardID).emit('change_board_name', data.newBoardName);
							socket.emit('change_board_name', data.newBoardName);
						}
					});
				});
			}

			var newUserdata = {
				user: user.username
			}
			newUserdata.type = canEdit? 'editors': 'followers';

			socket.broadcast.to(boardID).emit('new_live_user', newUserdata);
		});

		console.log('joined');
		socket.join(boardID);
		
	});

	socket.on('s_con_pen_color_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_color_change', data);
		con_pens[data.id].color = data.color;
	});

	socket.on('s_new_con_user', function(data) {
		
		con_pens.push(data.pen);
		socket.emit('concurrent_users', {
			con_pens: con_pens,
			users: users
		});
		console.log(data.pen);
		var userPenID = con_pens.length - 1;
		data.id = userPenID;
		data.user = {
			username: user.username
		};
		var users = getUsersOnBoard(boardID, user.username, function (users) {
			socket.emit('live_users', users);
		});
		socket.emit('penID', userPenID);
		
		socket.broadcast.to(boardID).emit('new_con_user', data);

	});

	socket.on('leaveBoard', function () {
		if (boardID) {
			socket.broadcast.to(boardID).emit('leaving_user', {
				username: user.username,
				displayName: user.displayName
			});
			socket.leave(boardID);
		}
		boardID = null;
		canEdit = false;
		console.log('Leaving board');
		socket.removeAllListeners('draw');
		socket.removeAllListeners('s_con_mouse_down');
		socket.removeAllListeners('s_con_mouse_move');
		socket.removeAllListeners('s_con_mouse_up');
		socket.removeAllListeners('s_clearBoard');
	});

	socket.on('remove_change_name', function () {
		socket.removeAllListeners('new_board_name');
	});

	socket.on('disconnect', function () {
		if (boardID) {
			socket.broadcast.to(boardID).emit('leaving_user', {
				username: user.username,
				displayName: user.displayName
			});
		}
	});
};