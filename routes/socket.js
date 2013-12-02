'use strict';

var api = require('./api');
var Cereal = require('cereal');

var penID = 0;

function nextPenID() {
	penID += 1;
	return penID;
};

var con_pens = [];

module.exports = function (socket) {

	var boardID = null;

	socket.on('joinBoard', function (_boardID) {
		boardID = _boardID;
		console.log('joined');
		socket.join(boardID);
	});

	socket.on('leaveBoard', function () {
		console.log('Disconnecting?');
		//socket.disconnect();
		socket.leave(boardID);
		boardID = null;
		//socket.emit('disconnect');
	});

	socket.on('draw', function(json) {
		// var request = {
		// 	body: {
		// 		boardName: 'testBoard2',
		// 		boardData: json
		// 	}
		// };
		// api.saveBoard(request, {}, function(data) {
		// 	console.log('cool');
		// });
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

	socket.on('s_new_con_user', function(data) {
		con_pens.push(Cereal.parse(data.pen));
		
		console.log(data.pen);
		var userPenID = con_pens.length - 1;
		data.id = userPenID;
		socket.emit('penID', userPenID);
		socket.emit('concurrent_users', con_pens);
		socket.broadcast.to(boardID).emit('new_con_user', data);
	});

	socket.on('s_clearBoard', function(data) {
		socket.broadcast.to(boardID).emit('clearBoard', {});
	});
};