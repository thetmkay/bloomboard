/**
 * Module dependencies
 */

var express = require('express'),
	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	sass = require('node-sass'),
	GoogleStrategy = require('passport-google').Strategy,
	GitHubStrategy = require('passport-github').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	LinkedInStrategy = require('passport-linkedin').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	AmazonStrategy = require('passport-amazon').Strategy,
	passportSocketIo = require("passport.socketio");


var MemoryStore = express.session.MemoryStore,
sessionStore = new MemoryStore();



var app = module.exports = express();
var dbURl;
var hostname;

/**
 * Configuration
 */

// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
	hostname = "http://localhost:3000";
	//use dev database
	api.setDbUrl('mongodb://tom:biscuit@paulo.mongohq.com:10010/app18852387');

}

if (app.get('env') === 'staging') {
	app.use(express.errorHandler());
	hostname = "http://bloomboard-staging.herokuapp.com";
	//use staging database
	api.setDbUrl('mongodb://niket:kiwi@linus.mongohq.com:10067/bloomboard-staging');
}

// production only
if (app.get('env') === 'production') {
	//use production database
	hostname = "http://bloomboard.herokuapp.com"; 
	api.setDbUrl('mongodb://niket:kiwi@paulo.mongohq.com:10053/bloomboard-production');
}

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
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
app.use(allowCrossDomain);
app.use(express.session({
	store: sessionStore,
	secret: 'keyboard cat',
	cookie: {
		httpOnly: false
	}
}));
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//   });
app.use(passport.initialize());
app.use(passport.session());
app.use(sass.middleware({
	src:"/public/scss/",
	dest:"/public/",
	debug:true
}));
app.use(app.router);


passport.serializeUser(function(identifier, done) {
	done(null, identifier);
});

passport.deserializeUser(function(identifier, done) {
	api.findIdentifier(identifier, done);
});

passport.use(new GoogleStrategy({
		returnURL: hostname + '/auth/google/return',
		realm: hostname
	},
	function(identifier, profile, done) {
		console.log(JSON.stringify(identifier, null, 4))
		console.log(JSON.stringify(profile, null, 4))
		process.nextTick(function() {
			api.findIdentifier(identifier, function(err, user) {
				if (err) {
					console.log("err")
					//handle error
				}
				if (user) {
					done(err, identifier);
				} else {
					console.log("create");
						var userdata = {
						email: profile.emails[0].value,
						displayName: profile.displayName,
						identifier: identifier,
						username: identifier.concat("#")
					}
					//create the user
					api.createUser(userdata, function(err, user) {
						done(err, identifier);
					});
				}
			});
		});
	}
));

passport.use(new LinkedInStrategy({
    consumerKey: '75x2qip8mgg1j8',
    consumerSecret: 'Ulm16VBg2DxRKAC7',
    callbackURL: hostname + '/auth/linkedin/callback',
    profileFields: ['id', 'email-address', 'first-name', 'last-name', 'formatted-name']
  },

  function(token, tokenSecret, profile, done) {
  	console.log(JSON.stringify(token, null, 4));
  	console.log(JSON.stringify(tokenSecret, null, 4));
  	console.log(JSON.stringify(profile, null, 4));
		api.findIdentifier(token, function(err, user) {
			if (err) {
				console.log("err")
				//handle error
			}
			if (user) {
				done(err, token);
			} else {
				console.log("create");
				var userdata = {
					email: profile.emails[0].value,
					displayName: profile.displayName,
					identifier: token,
					tokenSecret: tokenSecret,
					username: token.concat("#")
				}
				//create the user
				api.createUser(userdata, function(err, user) {
					done(err, token);
				});
			}
		});
  }
));

passport.use(new FacebookStrategy({
		clientID: '578316868906675',
		clientSecret: 'f4595346270e6511bd8b0fbe4b2124df',
		callbackURL: hostname + "/auth/facebook/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log(JSON.stringify(accessToken, null, 4));
		console.log(JSON.stringify(profile, null, 4));
		// User.findOrCreate(..., function(err, user) {
		//   if (err) { return done(err); }
		//   done(null, user);
		// });
	}));

passport.use(new TwitterStrategy({
    consumerKey: '4QESkVEmWkLQipp2RqRDbA',
    consumerSecret: 'bnEjHfZzkjf7EaPp6RIJySqeOxGjj4wFaaAAZmIa8',
    callbackURL: hostname + "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(JSON.stringify(token, null, 4));
    console.log(JSON.stringify(tokenSecret, null, 4));
    console.log(JSON.stringify(profile, null, 4));

    api.findIdentifier(token, function(err, user) {
			if (err) {
				console.log("err")
				//handle error
			}
			if (user) {
				done(err, token);
			} else {
				console.log("create");
				var userdata = {
					displayName: profile.displayName,
					identifier: token,
					tokenSecret: tokenSecret,
					username: token.concat("#")
				}
				console.log(JSON.stringify(userdata, null, 4));
				//create the user
				api.createUser(userdata, function(err, user) {
					done(err, token);
				});
			}
		});
  }
));

passport.use(new AmazonStrategy({
		clientID: 'amzn1.application-oa2-client.929fd0254df84374842b69a732b80d82',
		clientSecret: '925b9546ba6eed13a889d143529eb795603f4f5d1f528ca59f1412364d6bf60f',
		callbackURL: hostname + '/auth/amazon/callback'
	},
	function (accessToken, refreshToken, profile, done) {
		console.log(JSON.stringify(accessToken, null, 4));
		console.log(JSON.stringify(refreshToken, null, 4));
		console.log(JSON.stringify(profile, null, 4));
		console.log(JSON.stringify(done, null, 4));

	}
));


/*CHANGE FINDUSER CALL IF USING THIS METHOD*/
// passport.use(new GitHubStrategy({
// 		clientID: '3bcd23ba5325cf3d055f',
// 		clientSecret: '7578c07d947eea83b37c45b267d8dcdc70ec67f1',
// 		callbackURL: hostname + "/auth/github/callback"
// 	},
// 	function(accessToken, refreshToken, profile, done) {
// 		// asynchronous verification, for effect...
// 		process.nextTick(function() {
// 			console.log(JSON.stringify(profile, null, 4));
// 			//    profile.identifier = identifier;
// 			// api.findUser(profile.emails[0].value, function(err,user) {
// 			// 	if(err) {
// 			// 		console.log("err")
// 			// 		//handle error
// 			// 	}
// 			// 	if(user) {
// 			// 		done(err, profile.emails[0].value);
// 			// 	}
// 			// 	else {
// 			// 		console.log("create");
// 			// 		//create the user
// 			// 		api.createUser(profile, function (err, user) {
// 			// 			done (err, profile.emails[0].value);
// 			// 		});
// 			// 	}
// 			// });
// 		});
// 	}));

/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
// app.get('/login', function(req, res){res.render('login');});
// JSON API
//app.put('/api/board', api.saveBoard);
//app.post('/api/board', api.getBoard);
app.put('/api/clearBoard', api.clearBoard);
app.get('/api/name', api.name);
app.get('/api/boards', api.getBoards);
app.get('/api/svg_png', api.svg_png);
app.get('/api/createBoard', api.createBoard);

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return',
	passport.authenticate('google', {
		failureRedirect: '/home'
	}), api.authCallback);
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback',
	passport.authenticate('github', {
		failureRedirect: '/home'
	}), api.authCallback);
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/home'
	}), api.authCallback);
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', {
    failureRedirect: '/home' 
  }), api.authCallback);

app.get('/auth/linkedin',
  passport.authenticate('linkedin', {scope: ['r_basicprofile', 'r_emailaddress']}));
app.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', {
		failureRedirect: '/home'
	}), api.authCallback);
app.get('/auth/amazon',	passport.authenticate('amazon', { scope: ['profile', 'postal_code'] }));
app.get('/auth/amazon/callback', 
	passport.authenticate('amazon', {
		failureRedirect: '/home'
	}), api.authCallback);

//app.post('/api/createBoard', api.createBoard);
app.post('/api/duplicateBoard', api.duplicateBoard);
app.post('/api/fetchBoard', api.fetchBoard);

app.post('/api/addUsersAccess', api.addUsersAccess);
app.post('/api/deleteBoard', api.deleteBoard);
app.post('/api/setUsername', api.setUsername);
app.post('/api/switchAccess', api.switchAccess);
app.post('/api/removeAccess', api.removeAccess);

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

 function onAuthorizeSuccess(data, accept) {
	console.log('successful connection to socket.io');
	console.log(JSON.stringify(data, null, 4));

	// The accept-callback still allows us to decide whether to
	// accept the connection or not.
	accept(null, true);
};

function onAuthorizeFail(data, message, error, accept) {
	if (error)
		throw new Error(message);
	console.log('failed connection to socket.io:', message);

	// We use this callback to log all of our failed connections.
	accept(null, false);
};


var server = http.createServer(app),
	io = require('socket.io').listen(server),
	bloomboardSocket = require('./routes/socket');

io.set('authorization', passportSocketIo.authorize({
	cookieParser: express.cookieParser,
	secret: 'keyboard cat', // the session_secret to parse the cookie
	key: 'connect.sid', //the cookie where express (or connect) stores its session id.
	store: sessionStore, // we NEED to use a sessionstore. no memorystore please
	passport: passport,
	success: onAuthorizeSuccess, // *optional* callback on success - read more below
	fail: onAuthorizeFail // *optional* callback on fail/error - read more below
}));

bloomboardSocket.setIO(io);

io.sockets.on('connection', bloomboardSocket.newSocket);

server.listen(app.get('port'), function(req, res) {
	console.log('Express server listening on port ' + app.get('port'));
});
