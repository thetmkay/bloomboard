'use strict';

module.exports = function (socket) {
	socket.on('draw', function(json) {
		socket.emit('update_sketch', json);
		console.log('draw event called');
	});
};