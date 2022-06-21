var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
var bcrypt = require('bcrypt');
var passport = require('passport');
const flash = require('express-flash')
const LocalStrategy = require("passport-local").Strategy;
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

require('dotenv').config();
var Schema = mongoose.Schema
var User = require('./models/user')

var db_url = process.env.DB_URL;
var session_secret = process.env.SESSION_SECRET;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoDb = db_url;
mongoose.connect(mongoDb, {useUnifiedTopology: true, useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, "mongo connection error"));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
    function(username, password, done) {
    User.findOne({ email: username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
    // passwords match! log user in
      return done(null, user)
    } else {
    // passwords do not match!
      return done(null, false, { message: "Incorrect password" })
  }
})
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(flash())
app.use(session({ secret: session_secret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
