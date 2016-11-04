var crypto = require('crypto');
var Request = require('request');
var OAuth   = require('oauth-1.0a');
var auth = require('./config/auth');

/** Setup OAuth + Crypto to sign */
var oauth = OAuth({
  consumer: {
    key: auth.consumerKey,
    secret: auth.consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function: function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

/** Define requests object that contine all gequired data from twitter API  */
var url = 'https://api.twitter.com/1.1/';
var requests = {
    get: 'GET',
    post: 'POST',
    timeline:     url + 'statuses/home_timeline.json',
    friends:      url + 'friends/list.json',
    messages:     url + 'direct_messages.json',
    tweet:        url + 'statuses/update.json',
    unfollow:     url + 'friendships/destroy.json',
    follow:       url + 'friendships/create.json',
    like:         url + 'favorites/create.json',
    unlike:       url + 'favorites/destroy.json',
    retweet:      url + 'statuses/retweet/',
    unretweet:    url + 'statuses/unretweet/',
    params: {
      count: '5'
    }
};

/** Calculate how much time has passed from a certain timestamp */
function getDate(date) {
  var created = new Date(date);
  var now = new Date();
  var year = created.getUTCFullYear();
  var date = new Date(now - created);
  var hours = date.getUTCHours();
  var days = date.getUTCDate() - 1;
  var months = date.getUTCMonth();
  var minutes = date.getUTCMinutes();
  var output;

  if (now.getFullYear() - year) {
    output = now.getFullYear() - year + ' years ago';
  } else if (months > 0) {
    if (months === 1) {
      output = months + ' month ago'
    } else {
      output = months + ' months ago'
    }
  } else if (days > 0) {
    output = days + ' days ago';
  } else if (hours) {
    output = hours + ' hours ago';
  } else {
    output = minutes + ' minutes ago'
  }

  return output;
}

function renderNewTweets(req, res) {
 
}

module.exports = {
  
  dashboard: function(req, res) {
    /** Get the user profile data */
    var user = {
      name: req.user.profile.displayName,
      screenName: req.user.profile.username,
      profileBackUrl: req.user.profile._json.profile_background_image_url,
      profileImgUrl: req.user.profile._json.profile_image_url,
      friends: req.user.profile._json.friends_count
    }

    /** Get the user timeline data */
    var getTimeline = new Promise(function(resolve, reject) {
      Request({
        url: requests.timeline,
        method: requests.get,
        data: requests.params,
        qs: oauth.authorize({url: requests.timeline, method: requests.get, data: requests.params}, req.token),
        json: true
      }, function(error, response, tweets) {
        if (!error && response.statusCode === 200) {
          var tweetsArr = [];
          for (var i = 0; i < tweets.length; i++) {
            var tweet = tweets[i];
            tweetsArr.push({
              id: tweet.id_str,
              created: getDate(tweet.created_at),
              text: tweet.text,
              name: tweet.user.name,
              screenName: tweet.user.screen_name,
              profileImgUrl: tweet.user.profile_image_url,
              retweet_count: tweet.retweet_count,
              favorite_count: tweet.favorite_count,
              favorited: tweet.favorited ? 'like' : 'unlike',
              retweeted: tweet.retweeted ? 'retweet' : 'unretweet'
            });
          }
          resolve(tweetsArr);
        } else {
          reject(error);
        }
      });
    });
    
    /** Get the user friends data */
    var getFriends = new Promise(function(resolve, reject) {
      Request({
        url: requests.friends,
        method: requests.get,
        data: requests.params,
        qs: oauth.authorize({url: requests.friends, method: requests.get, data: requests.params}, req.token),
        json: true
      }, function(error, response, friends) {
        if (!error && response.statusCode === 200) {
          var friendsArr = [];
          for (var i = 0; i < friends.users.length; i++) {
            var friend = friends.users[i];
            friendsArr.push({
              name: friend.name,
              screenName: friend.screen_name,
              profileImgUrl: friend.profile_image_url,
              following: friend.following
            });
          }
          resolve(friendsArr);
        } else {
          reject(error);
        }
      });
    });

    /** Get the user messages data */
    var getMessages = new Promise(function(resolve, reject) {
      Request({
        url: requests.messages,
        method: requests.get,
        data: requests.params,
        qs: oauth.authorize({url: requests.messages, method: requests.get, data: requests.params}, req.token),
        json: true
      }, function(error, response, messages) {
        if (!error && response.statusCode === 200) {
          var messagesArr = [];
          for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            messagesArr.push({
              text: message.text,
              created: getDate(message.created_at),
              name: message.sender.name,
              profileImgUrl: message.sender.profile_image_url
            });
          }
          resolve(messagesArr);
        } else {
          reject(error);
        }
      });
    });

    /** Render the dashboard page if all promises as been resolved */
    Promise.all([getTimeline, getFriends, getMessages]).then(function(data) {
      res.render('dashboard', {
        title: 'Dashboard',
        user: user,
        tweets: data[0],
        friends: data[1],
        messages: data[2]}
      );
    /** Render the error page if one of the promises has been reject */
    }).catch(function(error) {
      res.redirect('/?error=api');
    })
  }, /** End dashboard method */

  newTweet: function(reply, req, res) {
    /** Send the request to post the tweet */
    var postTweet = new Promise(function(resolve, reject) {
      var tweet = req.body.tweet;
      var data = {
        status: tweet
      };
      
      reply ? data.in_reply_to_status_id = req.body.reply : '';
      
      Request({
        url: requests.tweet,
        method: requests.post,
        data: data,
        qs: oauth.authorize({url: requests.tweet, method: requests.post, data: data}, req.token),
        json: true
      }, function(error, response, message) {
        if (!error && response.statusCode === 200) {
          resolve();
        } else {
          reject(error);
        }
      });
    })
    .then(function() {
      /** Sent request to get new tweets that not in the dashboard timeline */
      return new Promise(function(resolve, reject) {
        Request({
          url: requests.timeline,
          method: requests.get,
          data: requests.params,
          qs: oauth.authorize({url: requests.timeline, method: requests.get, data: requests.params}, req.token),
          json: true
        }, function(error, response, tweets) {
          if (!error && response.statusCode === 200) {
            resolve(tweets);
          } else {
            reject(error);
          }
        });
      })    
      .then(function(tweets) {
      /**
       * Render the timeline page if all promises as been resolved.
       * Push the rendered html to the tweetsArr.
       * Send the tweetsArr.
       * */
      var tweetsArr = [];
      for (var i = 0; i < tweets.length; i++) {
        var tweet = tweets[i];
        if (req.body.id.indexOf(tweet.id_str) < 0) {
          res.render('partials/_tweet', {
            id: tweet.id_str,
            created: getDate(tweet.created_at),
            text: tweet.text,
            name: tweet.user.name,
            screenName: tweet.user.screen_name,
            profileImgUrl: tweet.user.profile_image_url,
            retweet_count: tweet.retweet_count,
            favorite_count: tweet.favorite_count,
            favorited: tweet.favorited ? 'like' : 'unlike',
            retweeted: tweet.retweeted ? 'retweet' : 'unretweet'
          }, function(err, html) {
            tweetsArr.push(html);
          });
        }
      }
      res.json(tweetsArr);
    })
    .catch(function(error) {
      console.log(error.message);
    });
    });
  }, /** End newTweet method */

  follow: function(follow, req, res) {
    var screenName = req.body.screenName;
    var url = follow ? requests.follow : requests.unfollow;

    /** Send the request to unfollow */
    Request({
      url: url,
      method: requests.post,
      data: { screen_name: screenName },
      qs: oauth.authorize({url: url, method: requests.post, data: { screen_name: screenName }}, req.token),
      json: true
    }, function(error, response, message) {
      if (!error && response.statusCode === 200) {
        res.send(follow);
      } else {
        console.log(error);
      }
    });
  }, /** End follow method */

  like: function(like, req, res) {
    var id = req.body.id;
    var url = like ? requests.like : requests.unlike;
    var num = like ? '1' : '-1';

    Request({
      url: url,
      method: requests.post,
      data: { id: id },
      qs: oauth.authorize({url: url, method: requests.post, data: { id: id }}, req.token),
      json: true
    }, function(error, response, message) {
      if (!error && response.statusCode === 200) {
        res.send(num);
      } else {
        console.log(error);
      }
    });
  }, /** End like method */

  retweet: function(retweet, req, res) {
    var id = req.body.id;
    var url = retweet ? requests.retweet + id : requests.unretweet + id;
    var num = retweet ? '1' : '-1';

    Request({
      url: url,
      method: requests.post,
      qs: oauth.authorize({url: url, method: requests.post}, req.token),
      json: true
    }, function(error, response, message) {
      if (!error && response.statusCode === 200) {
        res.send(num);
      } else {
        console.log(error);
      }
    });
  } /** End retweet method */

} /** End module.exports */