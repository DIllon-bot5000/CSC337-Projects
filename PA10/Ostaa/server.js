/*
Name: Dillon Barr
File: server.js
Course: CSC 337
Purpose: This file contains the Javascript used for the server side portion of the Ostaa
web application. Two schema are created to be used in the database, one for items and one for
users. This file contains two functions, one to validate the users cookies and one to remove
expired cookies. 
The server replies to a number of routes including:
  * adding a new user to the database
  * purchasing an item
  * logging in an existing user
  * adding an item
  * viewing a users listings
  * viewing a users purchases
  * getting the current username
  * finding items that match the input description
*/
const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(cookieParser());

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaa';

var sessionKeys = {};

// This function checks the keys within sessionKeys to see
// if they are still valid and if not they are removed from
// the collection.
function updateSessions() {
    let now = Date.now();
    for (e in sessionKeys) {
        if (sessionKeys[e][1] < now - 2000000) {
            delete sessionKeys[e];
        }
    }
}

setInterval(updateSessions, 2000);

var Schema = mongoose.Schema;
var ItemSchema = new Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String
});
var Item = mongoose.model('Item', ItemSchema);

var UserSchema = new Schema({
    username: String,
    password: String,
    listings: [],
    purchases: []
  });
var User = mongoose.model('User', UserSchema );

app.use('/index.html', express.static('public_html/index'));
app.use('/home.html', authenticate);
app.use('/post.html', authenticate);
app.use('/', express.static('public_html'));


mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// This function checks if the user has a valid key tied to their cookies
// and if not redirects to the login page to log in again.
function authenticate (req, res, next) {
    if (Object.keys(req.cookies).length > 0) {
        let u = req.cookies.login.username;
        let key = req.cookies.login.key;
        if (Object.keys(sessionKeys[u]).length > 0 && sessionKeys[u][0] == key) {
            next();
        }
        else {
          res.redirect('/index.html');
        }
    }
    else {
        res.redirect('/index.html');
    }
}

// This route creates a new user in the database if the desired username
// is not already taken.
app.post('/add/user/', (req, res) => {
    let userObject = JSON.parse(req.body.user);
    var user = new User(userObject);
    User.find({username: user.username})
    .exec(function(error, results) {
        if (results.length > 0){
            res.send('Bad');
        }
        else {
            user.save(function (err) { if (err) console.log('An error occurred'); });
            res.send('Successfully posted');
        }
    })
    
  });

// This route finds the desired item to be purchased, changes its status to SOLD and
// adds the item to the users purchased list.
app.post('/purchase/:KEYWORD', (req, res) => {
  let itemDesc = req.params.KEYWORD;
  let user = req.cookies.login.username;
  Item.find({description: itemDesc})
  .exec(function(error, results) {
    item = results[0];
    results[0].stat = 'SOLD';
    results[0].save(function(err) { if (err) console.log('An error occurred'); });
  })
  User.find({username: user})
  .exec(function(error, result) {
    result[0].purchases.push(item);
    result[0].save(function(err) { if (err) console.log('An error occurred'); });
    res.send('OK');
  })

})

// This route checks if a user exists in the database and if so creates a session
// and allows the user to log in.
app.get('/login/:USERNAME/:PASSWORD/', (req, res) => {
    let user = req.params.USERNAME;
    let pw = req.params.PASSWORD;
    User.find({username: user, password: pw})
    .exec(function(error, results) {
        if (results.length == 1) {
            let sessionKey = Math.floor(Math.random() * 1000);
            sessionKeys[user] = [sessionKey, Date.now()];
            res.cookie("login", {username: user, key: sessionKey}, {maxAge: 2000000});
            res.send('Success');
        }
        else {
            res.send('NOT ALLOWED');
        }
    });
  });

// This route creates a new item from the user input and creates a new item in
// the database. It also adds the item to the user's listing collection as well.
app.post('/add/item/', (req, res) => {
    let itemObject = JSON.parse(req.body.item);
    var item = new Item(itemObject);
    console.log(item);
    var user = mongoose.model('User', UserSchema);
    user.find({username: req.cookies.login.username})
    .exec(function(error, results) {
      results[0].listings.push(item);
      results[0].save(function (err) { if (err) console.log('An error occurred'); });
    })
    item.save(function (err) { if (err) console.log('An error occurred'); });
    res.send('Successfully posted');
  });

// This route returns all the listings tied to a specific user.
app.get('/get/listings/', (req, res) => {
    var userListings = mongoose.model('User', UserSchema);
    userListings.find({username: req.cookies.login.username})
    .exec(function(error, results) {
      res.send(JSON.stringify(results[0].listings));
    })
  });

// This route returns all the purchases tied to a specific user.  
app.get('/get/purchases/', (req, res) => {
    var userPurchases = mongoose.model('User', UserSchema);
    userPurchases.find({username: req.cookies.login.username})
    .exec(function(error, results) {
      res.send(JSON.stringify(results[0].purchases));
    })
  });

// This route returns all the items whose descriptions contain
// the "KEYWORD" substring.  
app.get('/search/items/:KEYWORD/', (req, res) => {
    var itemCollection = mongoose.model('Item', ItemSchema);
    itemCollection.find({})
    .exec(function(error, results) {
      var correctResult = [];
      for (i =0; i < results.length; i++) {
        if (results[i].description.includes(req.params.KEYWORD)){
          correctResult.push(results[i]);
        }
      }
      res.send(JSON.stringify(correctResult));
    })
  });

// This route returns all the items currently in the database.
app.get('/get/items/', (req, res) => {
    var itemCollection = mongoose.model('Item', ItemSchema);
    itemCollection.find({})
    .exec(function(error, results) {
      res.send(results);
    })
  });

// This route returns the current username and is used to update the
// welcome message.
app.get('/get/user/', (req, res) => {
    User.find({username: req.cookies.login.username})
    .exec(function(error, results) {
      res.send(results[0].username);
    })
});



const port = 80;
app.listen(port, () => {
    console.log('Server has started');
});