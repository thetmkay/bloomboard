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
		if (result) {
			var userdata = {
				email: user.email,
				forename: user.forename,
				surname: user.surname
			};
			done(null, userdata);
		} else {
			done(null, false);
		}
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/test/LoggedOut');
};

exports.createUser = function(req, res) {
	console.log(JSON.stringify(req.body, null, 4));
	var userDetails = 
		{email: req.body.email,
		forename: req.body.forename,
		surname: req.body.surname};
	mongodbLib.addUser(userDetails, req.body.password, function (added){
		if (!added) {
			res.redirect('/test/userexists');
		} else {
			res.redirect('/test/userAdded');
		}
	});
}; 

exports.findUser = function (email, callback) {
	mongodbLib.findUser(email, function(user){
		callback(null, user);
	});
};