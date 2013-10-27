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
	mongodbLib.saveBoard(req.params.boardData, function(result_){
		res.json(result_);
	})
};