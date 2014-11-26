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

if (process.env.OPENSHIFT_NODEJS_IP != null) {
    env = 'openshift';
}
console.log(env);

global.env = env;

app.configure(function () {
//    app.disable('x-powered-by');
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

app.configure('openshift', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

app.locals({
    settings: {
        ga: config.site[app.get('env')].ga_file
    }
});

var server = http.Server(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
    app.set('socket', socket);
});

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect(config.site[app.get('env')].mongoose.url);
//mongoose.connect(config.site[app.get('env')].mongoose.url, {auth: {authdb: "admin"}});

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + config.site[app.get('env')].mongoose.url);
    console.log(app.get('port'));

    express.createServer().listen(app.get('port'), function () {
        console.log("Application started at " + config.site[app.get('env')].baseUrl + ' in "' + app.get('env') + '" mode');
    });

    require('./routes')(app);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);

    http.createServer(function (req, res) {
        if (req.url != '/') {
            res.writeHead(301, {Location: '/'});
            res.end();
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('DB connection error');
    }).listen(config.site[app.get('env')].port, config.site[app.get('env')].host);
});


