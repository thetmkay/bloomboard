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

var getUsersOnBoard = function (boardID, socketID) {
	var handshaken = io.handshaken;
	return io.sockets.clients(boardID).filter(function (elem) {
		return elem.id !== socketID;
	}).map(function (elem) {
		return {
			username: handshaken[elem.id].user.username,
			displayName: handshaken[elem.id].user.displayName
		};
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

		

		api.sktGetWriteAccess(boardID, user._id, function (edit) {
			if (edit) {
				canEdit = edit;
				
				socket.on('draw', function(json) {
					api.saveBoard(boardID, json, function (err, doc) {
						console.log('cool');
					});
					socket.broadcast.to(boardID).emit('update_sketch', json);
				});

				socket.on('s_con_mouse_down', function(data) {
					socket.broadcast.to(boardID).emit('con_mouse_down', data);
				});

				socket.on('s_con_mouse_move', function(data) {
					socket.broadcast.to(boardID).emit('con_mouse_move', data);
				});

				socket.on('s_con_mouse_up', function(data) {
					socket.broadcast.to(boardID).emit('con_mouse_up', data);
				});

				socket.on('s_clearBoard', function(data) {
					socket.broadcast.to(boardID).emit('clearBoard', {});
				});

			}

		});

		console.log('joined');
		socket.join(boardID);
	});

	socket.on('s_new_con_user', function(data) {
		con_pens.push(Cereal.parse(data.pen));
		
		console.log(data.pen);
		var userPenID = con_pens.length - 1;
		data.id = userPenID;
		data.user = {
			username: user.username,
			displayName: user.displayName
		};
		var users = getUsersOnBoard(boardID, socket.id);
		socket.emit('penID', userPenID);
		
		socket.emit('concurrent_users', {
			con_pens: con_pens,
			users: users});
		socket.broadcast.to(boardID).emit('new_con_user', data);
	});

	// socket.on('draw', function(json) {
	// 	if (canEdit) {
	// 		api.saveBoard(boardID, json, function (err, doc) {
	// 			console.log('cool');
	// 		});
	// 		socket.broadcast.to(boardID).emit('update_sketch', json);
	// 	}
	// });

	// socket.on('s_con_mouse_down', function(data) {
	// 	if (canEdit) {
	// 		socket.broadcast.to(boardID).emit('con_mouse_down', data);
	// 	}
	// });

	// socket.on('s_con_mouse_move', function(data) {
	// 	if (canEdit) {
	// 		socket.broadcast.to(boardID).emit('con_mouse_move', data);
	// 	}
	// });

	// socket.on('s_con_mouse_up', function(data) {
	// 	if (canEdit) {
	// 		socket.broadcast.to(boardID).emit('con_mouse_up', data);
	// 	}
	// });

	// socket.on('s_clearBoard', function(data) {
	// 	if (canEdit) {
	// 		socket.broadcast.to(boardID).emit('clearBoard', {});
	// 	}
	// });

	// socket.on('s_new_con_user', function(data) {
	// 	con_pens.push(Cereal.parse(data.pen));
		
	// 	console.log(data.pen);
	// 	var userPenID = con_pens.length - 1;
	// 	data.id = userPenID;
	// 	data.user = {
	// 		username: user.username,
	// 		displayName: user.displayName
	// 	};
	// 	var users = getUsersOnBoard(boardID, socket.id);
	// 	socket.emit('penID', userPenID);
		
	// 	socket.emit('concurrent_users', {
	// 		con_pens: con_pens,
	// 		users: users});
	// 	socket.broadcast.to(boardID).emit('new_con_user', data);
	// });

	socket.on('leaveBoard', function () {
		console.log('Leaving board');
		socket.removeAllListeners('draw');
		socket.removeAllListeners('s_con_mouse_down');
		socket.removeAllListeners('s_con_mouse_move');
		socket.removeAllListeners('s_con_mouse_up');
		socket.removeAllListeners('s_clearBoard');
		if (boardID) {
			socket.broadcast.to(boardID).emit('leaving_user', {
				username: user.username,
				displayName: user.displayName
			});
			socket.leave(boardID);
		}
		boardID = null;
		canEdit = false;

	});
};