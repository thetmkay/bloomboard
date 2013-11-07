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

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/test/LoggedOut');
};

exports.createUser = function(req, res) {
	console.log(JSON.stringify(req.body, null, 4));
	mongo_lib.addUser(req.body.user, req.body.password, function (added){
		if (!added) {
			res.send(404);
		} else {
			req.logIn(req.body.user, function(err) {
				if (err) {
					res.json(null);
				} else {
					res.json(user);
				}
			});
		}
	});
}; 

exports.findUser = function (email, callback) {
	mongo_lib.findUser(email, function(err, user){
		callback(err, user);
	});
};