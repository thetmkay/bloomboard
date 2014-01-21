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

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

Array.prototype.intersection = function(a) {
    return this.filter(function(i) {return (a.indexOf(i) > -1);});
};

var getUsersOnBoard = function (board, username, callback) {
	var handshaken = io.handshaken;
	var boardID = board._id.toHexString();
	var onBoard = io.sockets.clients(boardID);
	var users = {
		read: {},
		write: {}
	};

	var length = onBoard.length;
	var i = 0;

	var getUsers = function () {
		if (i < length) {
			onBoard[i].get('user.username', function (err, uname) {
				var user = uname();
				if (username !== user) {
					onBoard[i].get('hasAccess', function (err, hasAccess) {
						if (hasAccess()) {
							onBoard[i].get('canEdit', function (err, canEdit) {
								if (canEdit()) {
									if (users.write[user]) {
										++users.write[user].instances;
									} else {
										users.write[user] = {
											instances: 1,
											writing: false
										};
									}
								} else {
									if (users.read[user]) {
										++users.read[user].instances;
									} else {
										users.read[user] = {
											instances: 1
										};
									}
								}
								i++;
								getUsers();
							});
						} else {
							i++;
							getUsers();
						}
					});
				} else {
					i++;
					getUsers();
				}
			});

		} else {
			callback(users);
		}
	};

	getUsers();



	// for (var i = 0; i < onBoard.length; i++) {
	// 	if (onBoard[i] !== username) {
	// 		if (board.writeAccess.indexOf(onBoard[i]) !== -1) {
	// 			if (users.write[onBoard[i]]) {
	// 				++users.write[onBoard[i]].instances;
	// 			} else {
	// 				users.write[onBoard[i]] = {
	// 					instances: 1,
	// 					writing: false
	// 				};
	// 			}
	// 		} else {
	// 			if (users.read[onBoard[i]]) {
	// 				++users.read[onBoard[i]].instances;
	// 			} else {
	// 				users.read[onBoard[i]] = {
	// 					instances: 1
	// 				};
	// 			}
	// 		}
	// 	}
	// }
	// callback(users);
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
		console.log(JSON.stringify(data));
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

	socket.on('s_con_textclick', function(data) {
		socket.broadcast.to(boardID).emit('con_textclick', data);
	});

	socket.on('s_clearBoard', function() {
		api.sktClearBoard(boardID, user.username, function () {
			socket.broadcast.to(boardID).emit('clearBoard');
		});
	});

	socket.on('s_con_delete_one', function(data) {
		var paths = [], texts = [];
		if (data.stroke.type === 'text') {
			texts = [
			{
				x: data.stroke.x,
				y: data.stroke.y,
				text: data.stroke.text
			}];
		} else if (data.stroke.type === 'path') {
			paths = [data.stroke.path];
		}
		api.sktDeletePaths(boardID, user.username, paths, texts, function () {
			socket.broadcast.to(boardID).emit('con_delete_one', data);
		});
		
	});

	socket.on('s_con_delete_set', function(data) {
		var paths = [];
		var texts = [];
		for (var i = 0; i < data.strokes.length; i++) {
			if (data.strokes[i].type === 'path') {
				paths.push(data.strokes[i].path);
			} else if (data.strokes[i].type === 'text') {
				texts.push({
					x: data.strokes[i].x,
					y: data.strokes[i].y,
					text: data.strokes[i].text
				});
			}
		}

		console.log(JSON.stringify(data, null, 4));
		// var paths = data.strokes.map(function (elem) {return elem.path});
		api.sktDeletePaths(boardID, user.username, paths, texts, function () {
			socket.broadcast.to(boardID).emit('con_delete_set', data);
		});
		
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
			api.sktRefreshBoard(boardID, function (boardAccess, write, read) {
				var sockets = io.sockets.clients(boardID);
				var newusers = data.usernames.readAccess.concat(data.usernames.writeAccess);
				var totalusers = read.concat(write);
				var added = newusers.intersection(totalusers);
				for (var i = 0; i < sockets.length; i++) {
					sockets[i].get('new_access', function (err, fn) {
						fn(boardAccess, added, write);
					});
				}
			});
		});
	});

	socket.on('switch_access', function (data) {
		if (user.username !== data.username) {
			api.sktSwitchAccess(data.username, user.username, data.currentAccess, boardID, function () {
					api.sktRefreshBoard(boardID, function (boardAccess) {
						var sockets = io.sockets.clients(boardID);
						for (var i = 0; i < sockets.length; i++) {
							sockets[i].get('switch_access', function (err, fn) {
								fn(data.username, data.currentAccess !== 'write', boardAccess);
							});
						}
					});
			});
		}
	});

	socket.on('remove_access', function (data) {
		if (user.username !== data.username) {
			api.sktRemoveAccess(data.username, user.username, boardID, function () {
				api.sktRefreshBoard(boardID, function (boardAccess) {
					var sockets = io.sockets.clients(boardID);
					for (var i = 0; i < sockets.length; i++) {
						sockets[i].get('remove_access', function (err, fn) {
							fn(data.username, boardAccess);
						});
					}
				});
			});
		}
	});

	socket.on('delete_board', function (data) {
		console.log('a');
		api.sktDeleteBoard(boardID, user.username, function () {
			var sockets = io.sockets.clients(boardID);
			for (var i = 0; i < sockets.length; i++) {
				sockets[i].get('delete_board', function (err, fn) {
					fn();
				});
			}
		});
	});

	socket.on('visibility_change', function (data) {
		api.sktSetPrivacy(boardID, user.username, data._public, function () {
			if (data._public) {
				socket.broadcast.to(boardID).emit('make_public');
			} else {
				var sockets = io.sockets.clients(boardID);
				for (var i = 0; i < sockets.length; i++) {
					sockets[i].get('make_private', function (err, fn) {
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
	socket.removeAllListeners('s_con_textclick');
	socket.removeAllListeners('s_clearBoard');
	socket.removeAllListeners('s_con_delete_one');
	socket.removeAllListeners('s_con_delete_set');
	socket.removeAllListeners('new_board_name');
	socket.removeAllListeners('new_access');
	socket.removeAllListeners('switch_access');
	socket.removeAllListeners('remove_access');
	socket.removeAllListeners('delete_board');
	socket.removeAllListeners('visibility_change');
};

var initializeEditResponse = function (socket, boardID) {
	
};

exports.newSocket = function (socket) {

	var boardID = null;
	var user = null;
	var canEdit = false;
	var hasAccess = false;



	socket.on('joinBoard', function (_boardID) {
		var data = false;
		boardID = _boardID;
		user = socket.manager.handshaken[socket.id].user;

		api.sktGetBoard(boardID, function (board) {
			canEdit = board.writeAccess.indexOf(user.username) != -1;
			hasAccess = canEdit || board.readAccess.indexOf(user.username) !== -1;

			if (canEdit) {
				initialise_writing(socket, boardID, user);
			}



			if (hasAccess) {
				var newUserdata = {
					user: user.username
				}
				newUserdata.type = canEdit? 'editors': 'followers';
				socket.broadcast.to(boardID).emit('new_live_user', newUserdata);
			}
			
			if (hasAccess || board._public) {
				api.sktRefreshBoard(board, function (boardAccess) {
					boardAccess.canEdit = canEdit;
					socket.emit('refreshEdit', boardAccess);
				});
				socket.emit('change_board_name', board.name);
				getUsersOnBoard(board, user.username, function (users) {
					console.log('r');
					socket.emit('live_users', users);
				});
				data = {
					_id: board._id.toHexString(),
					name: board.name,
					creation: board.creation,
					_public: board._public,
					canEdit: canEdit,
					data: board.data
				};
				
				socket.join(boardID);
				
			}
			socket.emit('joined', data);
		});	
		
	});

	socket.on('s_con_pen_color_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_color_change', data);
		con_pens[data.id].color = data.color;
	});

	socket.on('s_con_pen_width_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_width_change', data);
		con_pens[data.id].width = data.width;
	});

	socket.on('s_con_pen_opacity_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_opacity_change', data);
		con_pens[data.id].opacity = data.opacity;
	});

	socket.on('s_con_pen_dash_change', function(data) {
		socket.broadcast.to(boardID).emit('con_pen_dash_change', data);
		con_pens[data.id].dash = data.dash;
	});

	socket.on('s_new_con_user', function(data) {

		con_pens.push(data.pen);
		socket.emit('concurrent_users', {
			con_pens: con_pens
		});
		var userPenID = con_pens.length - 1;
		data.id = userPenID;
		data.user = {
			username: user.username
		};
		
		socket.emit('penID', userPenID);
		

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
		hasAccess = false;
		releaseListeners(socket);
		
	});

	socket.on('disconnect', function () {
		if (boardID) {

			var userdata = {
				user: user.username
			}
			userdata.type = canEdit? 'editors': 'followers';
			socket.broadcast.to(boardID).emit('leaving_user', userdata);
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
			canEdit = false;
			hasAccess = false;
			if (!boardAccess._public) {
				socket.leave(boardID);
			}
			socket.emit('deleted', {_public: boardAccess._public});
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

	socket.set('make_private', function () {
		if (hasAccess) {
			socket.emit('make_private');
		} else {
			releaseListeners(socket);
			socket.leave(boardID);
			boardID = null;
			hasAccess = false;
			socket.emit('deleted', {_public: false});
		}
	});

	socket.set('new_access', function (boardAccess, added, write) {
		if (added.indexOf(user.username) !== -1) {
			console.log(JSON.stringify(added, null, 4));
			hasAccess = true;
			canEdit = write.indexOf(user.username) !== -1;
			var newUserdata = {
				user: user.username
			}
			newUserdata.type = canEdit? 'editors': 'followers';
			socket.broadcast.to(boardID).emit('new_live_user', newUserdata);
			if (canEdit) {
				initialise_writing(socket, boardID, user);
				socket.emit('activate_board');
			}
		}
		boardAccess.canEdit = canEdit;
		socket.emit('refreshEdit', boardAccess);
	});

	socket.set('hasAccess', function () {
		return hasAccess;
	});

	socket.set('canEdit', function () {
		return canEdit;
	});

	socket.set('user.username', function () {
		return user.username;
	});

	
};