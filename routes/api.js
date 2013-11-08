/*
 * Serve JSON to our AngularJS client
 */

var db = require('mongoskin').db('mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387', {w: 1});
var mongo_lib = require('./mongo_db_lib');

mongo_lib.loadDB(db);

exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

exports.saveBoard = function(req, res, callback) {
	mongo_lib.saveBoard(req.body.boardName, req.body.boardData, function(err, doc) {
		done(err, doc);
	});
};

exports.getBoard = function (req, res) {
	if (req.isAuthenticated()) {
		mongo_lib.getBoard("testBoard2", function(_info) {
			result = _info;
			res.json(result);
		});
	} else {
		res.send(401);
	}
};

exports.login = function (email, password, done) {
	mongo_lib.authenticateUser(email, password, function(err, result, user) {
		if (result) {
			var userdata = {
				email: user.email,
			};
			done(err, userdata);
		} else {
			done(err, false);
		}
	});
};

exports.logout = function (req, res) {
	req.logout();
	res.send(200);
};

exports.createUser = function (details, callback) {
	mongo_lib.addUser(details.user, details.password, callback);
};

exports.findUser = function (email, callback) {
	mongo_lib.findUser(email, function(err, user){
		console.log('+++' + JSON.stringify(user, null, 4));
		callback(err, user);
	});
};

exports.getDisplayName = function (req, res) {
	if (req.isAuthenticated()) {
		res.json({displayName: req.user.displayName});
	} else {
		res.send(401);
	}
};