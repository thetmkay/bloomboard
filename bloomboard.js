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


/*--------------------CHANGE---------------- */
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

app.post('/api/createUser', api.createUser);

// app.get('/test/:param', function(req, res){
// 	res.render('test');
// });

/*-----------Change-------------------*/
app.post('/api/login', function (req, res, next) {
	console.log(JSON.stringify(req.body, null, 4));
	passport.authenticate('local', function (err, user) {
		var login = {login: false};
		if (!user) {
			res.json(null);
		} else {
			req.logIn(user, function(err) {
				if (err) {
					res.json(null);
				} else {
					//console.log(JSON.stringify(user, null, 4));
					res.json(user);
				}
			});
		}
	})(req, res, next);
});

app.get('/api/logout', api.logout);

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