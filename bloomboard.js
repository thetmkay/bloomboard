/**
 * Module dependencies
 */

var express = require('express'),
	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategys;

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
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.put('/api/board', api.saveBoard);
app.get('/api/board', api.getBoard);
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * JSON API
 */

/**
 * User Authentication
 */

passport.use(new LocalStrategy(
	function(email, password, done) {
		// database checks and return appropriate done function
	}));

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});