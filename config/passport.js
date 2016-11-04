var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('./auth');


module.exports = function(passport) {

  var user = {};

  /** used to serialize the user for the session */ 
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  /** used to deserialize the user */
  passport.deserializeUser(function(id, done) {
    done(null, user);
  });

  passport.use(new TwitterStrategy({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      callbackURL: config.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      user.id = profile.id;
      user.token = token;
      user.tokenSecret = tokenSecret;
      user.profile = profile;
      done(null, user);
    }
  ));
}
