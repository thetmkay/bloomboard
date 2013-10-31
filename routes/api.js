/*
 * Serve JSON to our AngularJS client
 */

var mongodbLib = require('./mongo_db_lib');

exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

exports.saveBoard = function(req, res) {
	mongodbLib.saveBoard(req.body.boardData);
};

exports.getBoard = function(req, res) {
	mongodbLib.getBoard("testBoard2", function(_info) {
		result = _info;
		res.json(result);
	});
};

exports.login = function(email, password, done) {
	console.log(email);
	mongodbLib.authenticateUser(email, password, function(result, user) {

	});
};