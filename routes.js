var bodyParser = require('body-parser');
var twitter = require('./twitter');

/** Middleware to check if the user is logged in */ 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.token = {
      key: req.user.token,
      secret: req.user.tokenSecret
    };
    return next();
  } else { 
    res.redirect('/?error=login');
  }
}

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    if (req.query.error) {
      if (req.query.error === 'login') {
        res.locals.error = { message: 'Please sign in' };
      } else if (req.query.error === 'api') {
        res.locals.error = { message: 'Twitter is not responding. Try again later' };
      }
    }
    if (req.isAuthenticated()) {
      res.locals.loggedIn = true;
    }
    res.render('index', { title: 'Login' });
  }); /** End / */

  /**
   * Redirect the user to Twitter for authentication. When complete,
   * Twitter will redirect the user back to the application at /twitter/callback
   */
  app.get('/twitter', passport.authenticate('twitter'));

  /**
   * Twitter will redirect the user to this URL after approval.
   * If access was granted, the user will be logged in. Otherwise, authentication has failed.
   */
  app.get('/twitter/callback', passport.authenticate('twitter', { successRedirect: '/twitter/success', failureRedirect: '/twitter/failure' }));

  app.get('/twitter/success', isLoggedIn, function(req, res) {
    res.end('Redirect...');
  }); /** End /twitter/success */

  app.get('/twitter/failure', function(req, res) {
    res.end('Redirect...');
  }); /** End /twitter/failure */

  app.get('/dashboard', isLoggedIn, function(req, res) {
    twitter.dashboard(req, res);
  }); /** End /dashboard */

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  }); /** End /logout */

  app.post('/tweet', isLoggedIn, function(req, res) {
    twitter.newTweet(false, req, res);
  }); /** End /tweet */

  app.post('/unfollow', isLoggedIn, function(req, res) {
    twitter.follow(false, req, res);
  }); /** End /unfollow */

  app.post('/follow', isLoggedIn, function(req, res) {
    twitter.follow(true, req, res);
  }); /** End /follow */

  app.post('/like', isLoggedIn, function(req, res) {
    twitter.like(true, req, res);
  }); /** End /like */

  app.post('/unlike', isLoggedIn, function(req, res) {
    twitter.like(false, req, res);
  }); /** End /unlike */

  app.post('/retweet', isLoggedIn, function(req, res) {
    twitter.retweet(true, req, res);
  }); /** End /retweet */

  app.post('/unretweet', isLoggedIn, function(req, res) {
    twitter.retweet(false, req, res);
  }); /** End /unretweet */

  app.post('/reply', isLoggedIn, function(req, res) {
    twitter.newTweet(true, req, res);
  }); /** End /reply */

}