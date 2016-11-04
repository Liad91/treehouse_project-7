'use strict';

/** Module dependencies */
var express = require('express');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var passportConfig = require('./config/passport');
var routes = require('./routes');
var app = express();

/** View engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/** Port setup */
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'as^ui390ioj(jd3i6hoi9.dw90id&8K0',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/assets', express.static(path.join(__dirname, 'public')));

/** Run passport config */
passportConfig(passport);

/** Use routes */
routes(app, passport);

/** Catch 404 and forward to error handler */
app.use(function(req, res, next) {
  res.status(404);
  res.render('error', {
    title: 404,
    status: 404,
    error : {
      message: 'Oops, This Page Not Found!'
    }
  });
});

/**
 * development error handler
 * will print stacktrace
 */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      title: 500,
      error: err
    });
  });
}

/**
 * production error handler
 * no stacktraces leaked to user
 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    title: 500,
    status: 500,
    error : {
      message: 'Oops, This Page Not Found!'
    }
  });
});

/** Run the server */
app.listen(3000, function() {
  console.log('Express server runing on port ' + app.get('port'));
});