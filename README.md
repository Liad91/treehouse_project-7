## Twitter Interface

![screen](https://cloud.githubusercontent.com/assets/19666213/20004269/f4b4cde2-a293-11e6-8254-0688d7fd96ce.jpg)

Twitter Interface is a [Node.js](https://nodejs.org/) application that uses [Twitter’s REST API](https://dev.twitter.com/rest/public) to access your Twitter profiles information and render it to a user.

### What it does?

 **After the user logged in he get access to :**
 
* 5 most recent tweets
* 5 most recent friends
* 5 most recent private messages
* Follow / Unfollow friends
* Like / Dislike tweets
* Send tweets
* Send replies
* Retweet

### Tech

Twitter Interface uses a number of open source projects to work properly:
* [node.js](http://nodejs.org/) - duh!
* [Express](https://github.com/expressjs/express) - Fast, unopinionated, minimalist web framework for node.
* [body-parser](https://github.com/expressjs/body-parser) - Node.js body parsing middleware.
* [express-session](https://github.com/expressjs/session) - Simple session middleware for Express
* [oauth-1.0a](https://github.com/ddo/oauth-1.0a) - OAuth 1.0a Request Authorization for Node and Browser.
* [Passport](https://github.com/jaredhanson/passport) - Simple, unobtrusive authentication for Node.js.
* [Request](https://github.com/request/request) - Simplified HTTP request client.

### preparation

Create a Twitter app through [Twitter’s developer portal](https://apps.twitter.com) and get the needed API keys.

### Installation

```
$ git clone https://github.com/Liad91//treehouse_project-7.git
$ cd treehouse_project-7
$ npm install 
```

### Setup
Create `config\auth.json` file:
```
{
  "consumerKey": "XXXXXXXXXXXXXXXXXXXXXXXX",
  "consumerSecret": "XXXXXXXXXXXXXXXXXXXXXXXX",
  "callbackURL": "http://XXXXXXXXXXXXXXXX/twitter/callback"
}
```

### Run

```
$ npm start
```

### Todos

- [ ] Add option to send direct messages.
- [ ] Add responsive design CSS.

### License

MIT

***Free Software, Hell Yeah!***
