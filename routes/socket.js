'use strict';

var api = require('./api');

module.exports = function (socket) {
	socket.on('draw', function(json) {
		var request = {
			body: {
				boardName: 'testBoard2',
				boardData: json
			}
		};
		// request.body['boardName'] = 'testBoard2';
		// request.body['boardData'] = json;
		api.saveBoard(request, {}, function(data) {
			console.log('cool');
		});
		socket.broadcast.emit('update_sketch', json);
		console.log('draw event called');
	});
};