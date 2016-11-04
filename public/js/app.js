'use strict';

/** Global object to expose methods */
var app = {};

$(document).ready(function() {

  var $ul = $('.app--tweet--list');
  var $li = $ul.children();
  var $text = $('#tweet-textarea');
  var $char = $('#tweet-char');
  var $textareas = $('.circle--textarea--input');

  /** Noty error message */
  var errorMsg = 'Try to refresh the page';
  
  /** Update remaining characters */
  function updateChars(event) {
    var counter = $(this).next();
    var chars = 140 - $(this).val().length;

    if (chars <= 0) {
      if (event.key !== 'Backspace') {
        event.preventDefault();
        counter.css('color', '#f66');
      }
    } else {
      counter.css('color', '#ccc');
    }
    counter.text(chars);
  }

  $textareas.keydown(updateChars).keyup(updateChars);

  /** Post a new tweet & display it */
  $('#send-tweet').click(function(event) {
    event.preventDefault();
    var $self = $(this);

    if ($text.val().length > 0 && $text.val().length <= 140) {
      /** Lock the submit button */
      $self.attr('disabled', true);
      
      $self.text('Tweeting');

      var url = '/tweet';
      var data = {
        tweet: $text.val()
      };

      /** Send the AJAX request */
      newTweetAJAX(url, data, newTweet, $self);

    } else {
      app.displayNote('Use 140 characters or fewer for tweet.', 'warning');
      $text.focus();
    }

    function newTweet(html) {

      /** Display success message */
      app.displayNote('Tweet sent', 'success');

      /** Reset the input value */
      $text.val('');

      /** Reset the remaining characters */
      $char.text(140);

      /** Unlock the submit button */
      $self.attr('disabled', false);

      $self.text('Tweet');
      
      /** Prepend the new tweets */
      prependNewTweets(html);     
    }
  }); /** End post a new tweet & display it */
  
  /** Post unfollow & follow */
  $('.button').click(function(event) {
    event.preventDefault();

    var $self = $(this);
    var screenName = $self.parent().prev().children().children('p').text().substring(1);

    $self.hasClass('unfollow') ? followAJAX('/unfollow') : followAJAX('/follow');

    function followAJAX(url) {
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({screenName: screenName}),
        contentType: 'application/json',
        success: followHandler,
        error: function() {
          app.displayNote(errorMsg, 'error');
        }
      });
    }

    function followHandler(follow) {
      if (!follow) {
        $self.removeClass('button-text unfollow').addClass('follow').text('Follow');
        app.displayNote('You\'re unfollowing <b>@' + screenName + '</b>', 'information');
      } else {
        $self.removeClass('follow').addClass('button-text unfollow').text('Unfollow')
        app.displayNote('You\'re following <b>@' + screenName + '</b>', 'success');
      }
      
    }

  }); /** End post unfollow & follow */


  var tweetActions = {

    /** Post like & unlike */
    like: function() {
      /** Make sure that the element doesn't have click event */
      $('.app--like').unbind('click');

      $('.app--like').click(function(event) {
        event.preventDefault();

        var $self = $(this);
        var status = $self.attr('like-status');
        var id = $self.parent().parent().parent().attr('id');
        var name = $self.parent().parent().prev().prev().children('h4').text().split(' |')[0];

        status === 'unlike' ? likeAJAX('/like') : likeAJAX('/unlike');

        function likeAJAX(url) {
          $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify({id: id}),
            contentType: 'application/json',
            success: likeHandler,
            error: function() {
              app.displayNote(errorMsg, 'error');
            }
          });
        }

        function likeHandler(num) {
          var likes = +$self.children('strong').text() + parseInt(num);
          var newStatus = status === 'like' ? 'unlike' : 'like';
          var tooltip = $self.children('span').text();
          if (num > 0) {
            app.displayNote('You\'re like <b>' + name + '</b> tweet', 'success');
          } else {
            app.displayNote('You\'re dislike <b>' + name + '</b> tweet', 'information');
          }
          tooltip === 'Like' ? $self.children('span').text('Unlike') : $self.children('span').text('Like');
          $self.children('strong').text(likes);
          $self.attr('like-status', newStatus);
        }
      }); 
    }, /** End like method*/

    /** Post retweet & unretweet */
    retweet: function() {
      /** Make sure that the element doesn't have click event */
      $('.app--retweet').unbind('click');

      $('.app--retweet').click(function(event) {
        event.preventDefault();

        var $self = $(this);
        var status = $self.attr('retweet-status');
        var id = $self.parent().parent().parent().attr('id');
        var name = $self.parent().parent().prev().prev().children('h4').text().split(' |')[0];

        status === 'unretweet' ? retweetAJAX('/retweet') : retweetAJAX('/unretweet');

        function retweetAJAX(url) {
          $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify({id: id}),
            contentType: 'application/json',
            success: retweetHandler,
            error: function() {
              app.displayNote(errorMsg, 'error');
            }
          });
        }
        
        function retweetHandler(num) {
          var retweets = +$self.children('strong').text() + parseInt(num);
          var newStatus = status === 'retweet' ? 'unretweet' : 'retweet';
          var tooltip = $self.children('span').text();
          if (num > 0) {
            app.displayNote('You retweeted <b>' + name + '</b> tweet', 'success');
          } else {
            app.displayNote('You unretweeted <b>' + name + '</b> tweet', 'information');
          }
          tooltip === 'Retweet' ? $self.children('span').text('Unretweet') : $self.children('span').text('Retweet');
          $self.children('strong').text(retweets);
          $self.attr('retweet-status', newStatus);
        }
      }); 
    }, /** End retweet method */

    /** Post reply */
    reply: function() {
      /** Make sure that the element doesn't have click event */
      $('.app--reply').unbind('click');

      $('.app--reply').click(function(event) {
        event.preventDefault();

        var $self = $(this);
        var id = $self.parent().parent().parent().attr('id');
        var imgURL = $self.parent().parent().prev().prev().children('.app--avatar').children('img').attr('src');
        var time = $self.parent().parent().parent().children('.app--tweet--timestamp').text();
        var name = $self.parent().parent().prev().prev().children('h4').text();
        var screenName = $self.parent().parent().prev().prev().children('h4').text().split('| ')[1];
        var tweet = $self.parent().parent().prev().text();
        var inst = $('[data-remodal-id=reply]').remodal();
        var $head = $('.remodal-head');
        var $body = $('.remodal-body');
        var $footer = $('.remodal-footer');
        var $text = $footer.children('textarea');
        var $loader = $('#loader');
        var $counter = $footer.children('span');
        var $submit = $footer.children('button');

        /** Open the remodal */
        inst.open();

        /** Manipulate the remodal child nodes */
        $head.children('h3').text('Reply to ' + screenName);
        $body.children('img').attr('src', imgURL);
        $body.children('p').html('<strong>' + name + '</strong><span class="right">' + time + '</span><br>' + tweet);
        $text.val(screenName + ' ');
        $counter.text(140 - $text.val().length);

        $submit.click(function(event) {

          /** Check if the replay contains @screenName */
          if ($text.val().indexOf(screenName) < 0) {
            app.displayNote('Use <b>' + screenName + '</b> to reply', 'warning');
            $text.focus();
          /** Check if the replay contains characters other than @screenName & if the replay not contains more than 140 characters */
          } else if (($text.val().length - (screenName.length + 1) ) <= 0 || $text.val().length >= 140) {
            app.displayNote('Use 140 characters or fewer for reply.', 'warning');
            $text.focus();  
          } else {
            /** Lock the submit button */
            $submit.attr('disabled', true);

            $submit.text('Tweeting');

            /** Show loader */
            $loader.show();

            var url = '/reply';
            var data = {
              reply: id,
              tweet: $text.val(),
            };

            /** Send the AJAX request */
            newTweetAJAX(url, data, newTweetReply, $submit, $loader);
          }

          function newTweetReply(html) {
            /** Close the remodal */
            inst.close();

            /** Unlock the submit button */
            $submit.attr('disabled', false);

            /** Show loader */
            $loader.hide();

            $submit.text('Tweet');

            /** Display success message */
            app.displayNote('Reply to <b>' + screenName + '</b> sent', 'success');

            /** Prepend the new tweets */
            prependNewTweets(html);
          }
        });

        /** Unbind the click event if the remodal is colsing */
        $(document).on('closing', '.remodal', function () {
          $submit.unbind('click');
        });

      }); 
    } /** End reply method */

  }; /** End tweetActions obj */

  /** Send AJAX request to post new tweet | reply */
  function newTweetAJAX(url, data, success, submitBtn, loader) {
    /** Set the id array */
    data.id = getTimelineIdArr();

    /** The AJAX request */
    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: success,
      error: function() {
        app.displayNote(errorMsg, 'error');
        submitBtn.attr('disabled', false);
        submitBtn.text('Tweet');

        loader ? loader.hide() : '';
      }
    });
  }

  /** Returns all the ids of the tweets in the timeline */
  function getTimelineIdArr() {
    var $li = $('ul.app--tweet--list').children();
    var id_arr = []; 

    $.each($li, function() {
      id_arr.push($(this).attr('id'));
    })

    return id_arr;
  }

  /** Prepend the new tweet that recieved after post new tweet | reply */
  function prependNewTweets(tweets) {
    var num = tweets.length;

    /** Prepend the tweets */
    for (var i = tweets.length; i > 0; i--) {
      $ul.prepend(tweets[i-1]);                  
    }

    /** Bind the tweetActions methods for each new tweet */
    tweetEvents();


    /** If there is more then 5 tweets in the timeline remove the oldest */
    if ($ul.children().length > 5) {
      for (var i = $ul.children().length; i > 0; i--) {
        if (num) {
          $ul.children().last().remove();
          num--;
        }
      }
    }  
  }
  
  /** Noty.js - display notes */
  app.displayNote = function(msg, type) {
    var note = noty ({
      text: msg,
      type: type,
      layout: 'topCenter',
      maxVisible: 5,
      animation: {
        open: 'animated fadeInDown',
        close: 'animated fadeOutUp'
      },
      timeout: 4000
    })
  }

  /** Invoke all the methods of tweetActions */
  function tweetEvents() {
    for (var key in tweetActions) {
      if (tweetActions.hasOwnProperty(key)) {
        tweetActions[key]();
      }
    }
  }

  tweetEvents();

});

