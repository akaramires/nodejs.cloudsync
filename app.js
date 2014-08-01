var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('./config'),
    flash = require('express-flash'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    url = require('url');

var app = express();

var env = process.argv[2] || process.env.NODE_ENV || 'development';
global.env = env;

app.configure(function () {
    app.disable('x-powered-by');
    app.set('env', env);
    app.set('port', config.site[app.get('env')].port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({ keepExtensions: true }))
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.site[app.get('env')].cookieSecret));
    app.use(express.session({
        secret: config.site[app.get('env')].sessionSecret,
        store : new RedisStore
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.enable('verbose errors');
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect(config.mongoose.url);

var server = require('http').Server(app);
io = require('socket.io')(server);

io.on('connection', function (socket) {
    app.set('socket', socket);
});

server.listen(app.get('port'), function () {
    console.log("Application started at " + config.site[app.get('env')].baseUrl + ' in "' + app.get('env') + '" mode');
});

// routes
require('./routes')(app);

