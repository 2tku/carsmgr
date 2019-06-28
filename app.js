var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// user authen
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require('express-session');

var authenUtil = require('./utils/authenUtils.js');

var index = require('./routes/index');
var tasks = require('./routes/tasks');
var authen = require('./routes/authen');
var exportData = require('./routes/export');
var path = require('path');

global.G_APP_ROOT = path.resolve(__dirname);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express
app.use(session({ 
    secret: 'shhsecret' ,
    // secret: cookie_secret,
    resave: true,
    saveUninitialized: true
}));  
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/authen', authen);
app.use('/tasks', tasks);
app.use('/export', exportData);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

app.set('port', process.env.PORT || 6060);
app.listen(app.get('port'));

//===============mongoose=================
// Use native Node promises
mongoose.Promise = global.Promise;

// configuration =================
var options = {
    // useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 1, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true
};

mongoose.connect('mongodb://thuattq:thuattq@ds125556.mlab.com:25556/carsmgr', options)
    .then(() =>  console.log('connection succesful'))
    .catch((err) => console.error('err when connect db; error: ' + err));

//===============PASSPORT=================

// Passport session setup.
passport.serializeUser(function(user, done) {
    console.log("serializing " + user.username);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
passport.use('local-signin', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username, password, done) {
        authenUtil.localAuth(username, password)
        .then(function (user) {
            if (user) {
                console.log("LOGGED IN AS: " + user.username);
                req.session.success = 'Đăng nhập người dùng ' + user.username + ' thành công!';
                // req.session.userRole = user.role;
                done(null, user);
            }
            if (!user) {
                console.log("COULD NOT LOG IN");
                req.session.error = 'Đăng nhập không thành công.'; //inform user could not log them in
                done(null, user);
            }
        })
        .fail(function (err){
            console.log(err.body);
        });
    }
));

// Use the LocalStrategy within Passport to Register/"signup" users.
passport.use('local-signup', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username, password, done) {
        authenUtil.localReg(username, password, req.param('fullName'), req.param('roleUser'))
        .then(function (returnObject) {
            console.log('get user: ');
            console.log(returnObject.user);
            if (returnObject.user != null) {
                console.log("REGISTERED: " + returnObject.user.user_name);
                req.session.success = 'Tạo thành công người dùng ' + returnObject.user.user_name + '!';
                done(null, returnObject.user);
            } else {
                console.log("COULD NOT REGISTER");
                req.session.error = 'Người dùng đã tồn tại, tạo người dùng khác.'; //inform user could not log them in
                done(returnObject.errorMsg, returnObject.user);
            }

            // if (!returnObject.user)
        })
        .fail(function (err){
            console.log(err.body);
        });
    }
));