/*
 * Serve JSON to our AngularJS client
 */

var db = require('mongoskin').db('mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387', {w: 1});
var mongo_lib = require('./mongo_db_lib');

mongo_lib = mongo_lib.loadDB(db);

exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

exports.saveBoard = function(req, res) {
	mongo_lib.saveBoard(req.body.boardData);
};

exports.getBoard = function(req, res) {
	mongo_lib.getBoard("testBoard2", function(_info) {
		result = _info;
		res.json(result);
	});
};

exports.login = function(email, password, done) {
	console.log(email);
	mongo_lib.authenticateUser(email, password, function(result, user) {

	});
};