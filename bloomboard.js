/**
 * Module dependencies
 */

var hostname = 'http://localhost:3000';

var express = require('express'),
	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	sass = require('node-sass'),
	GoogleStrategy = require('passport-google').Strategy;


passport.serializeUser(function(email, done) {
	done(null, email);
});

passport.deserializeUser(function(email, done) {
	api.findUser(email, function (err, user2) {
		done(err, user2);
	});
});

passport.use(new GoogleStrategy({
	returnURL: hostname + '/auth/google/return',
	realm: hostname}, 
	function(identifier, profile, done) {
		process.nextTick(function () {
			profile.identifier = identifier;
			api.findUser(profile.emails[0].value, function(err,user) {
				if(err) {
					console.log("err")
					//handle error
				}
				if(user) {
					done(err, profile.emails[0].value);
				}
				else {
					console.log("create");
					//create the user
					api.createUser(profile, function (err, user) {
						done (err, profile.emails[0].value);
					});
				}
			});
		});
	}
));

var app = module.exports = express();
var dbURl;


/**
 * Configuration
 */

// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
	hostname = 'http://localhost:3000';
	//use dev database
	api.setDbUrl('mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387');
}

// production only
if (app.get('env') === 'production') {
	//use production database
	hostname = "www.bloomboard-staging.herokuapp.com"; 
	api.setDbUrl('mongodb://niket:kiwi@paulo.mongohq.com:10053/bloomboard-production');
}


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(sass.middleware({
	src:"/public/scss/",
	dest:"/public/",
	debug:true
}));
app.use(app.router);



/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
// app.get('/login', function(req, res){res.render('login');});
// JSON API
app.put('/api/board', api.saveBoard);
app.get('/api/board', api.getBoard);
app.put('/api/clearBoard', api.clearBoard);
app.get('/api/name', api.name);
app.get('/api/boards', api.getBoards);
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', 
  passport.authenticate('google', { successRedirect: '/boards',
                                    failureRedirect: '/home' }));

app.post('/api/createBoard', api.createBoard);
app.post('/api/createUser', function (req, res) {
	api.createUser(req.body, function (added) {

		if (!added) {
			res.send(401);

		} else {
			req.body.email = req.body.user.email;
			passport.authenticate('local', function (err, user) {
				if (!user) {
					res.send(401);
				} else {
					req.logIn(user, function(err) {
						if (err) {
							res.send(401);
						} else {
							api.findUser(user.email, function (err, userInfo) {

					    	userData = {
					    		email: userInfo.email,
					    		displayName: userInfo.displayName
					    	};
					    	res.json(userData);
					    });
						}
					});
				}
			})(req, res);
		}
	});
});

app.post('/api/fetchBoard', api.fetchBoard);

app.post('/api/addUsersAccess', api.addUsersAccess);


app.post('/api/login',
  passport.authenticate('local'),
  function (req, res) {
		var user = req.user;
		var userdata = {
			email: user.email,
    	displayName: user.displayName
		};
		res.json(userdata);
  });

app.get('/api/isActiveSession', api.isActiveSession);

app.get('/api/logout', api.logout);

app.get('/api/getDisplayName', api.getDisplayName);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * JSON API
 */

/**
 * User Authentication
 */



/**
 * Start Server and Socket Connection
 */

var server = http.createServer(app),
	io = require('socket.io').listen(server);

io.sockets.on('connection', require('./routes/socket'));

server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});