/**
 * Module dependencies
 */

var express = require('express'),
	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
	done(null, user.email)
});

passport.deserializeUser(function(email, done) {
	api.findUser(email, function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy({
	usernameField: 'email', 
	passwordField: 'password'}, 
	api.login));

var app = module.exports = express();


/**
 * Configuration
 */


// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
	//TODO
};

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
app.get('/api/name', api.name);

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
							res.cookie.userData = user;
							res.json(user);
						}
					});
				}
			})(req, res);
		}
	});
});

// app.get('/test/:param', function(req, res){
// 	res.render('test');
// });

/*-----------Change-------------------*/
app.post('/api/login', function (req, res, next) {

	passport.authenticate('local', function (err, user) {
		if (!user) {
			res.send(401);
		} else {
			req.logIn(user, function(err) {
				if (err) {
					res.send(401);
				} else {
					res.json(req.user);
				}
			});
		}
	})(req, res, next);
});

app.get('/api/logout', api.logout);

app.post('/test', function (req, res) {
	console.log(JSON.stringify(req.user, null, 4));
	res.json({});
});

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
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});