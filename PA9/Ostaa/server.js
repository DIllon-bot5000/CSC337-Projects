/*
Name: Dillon Barr
File: server.js
Course: CSC 337
Purpose: This file contains the Javascript used for the server side portion of the Ostaa
web application. Two schema are created to be used in the database, one for items and one for
users. The server uses the index.html to respond to static requests while responding
to various domain requests to display the desired information to the user.
*/


const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaa';

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

app.use(express.static('public_html'))

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// This route returns all the users currently in the database.
app.get('/get/users/', (req, res) => {
    var userCollection = mongoose.model('User', UserSchema);
    userCollection.find({})
    .exec(function(error, results) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(results, null, 4));
    })
  });

// This route returns all the items currently in the database.
app.get('/get/items/', (req, res) => {
    var itemCollection = mongoose.model('Item', ItemSchema);
    itemCollection.find({})
    .exec(function(error, results) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(results, null, 4));
    })
  });

// This route returns all the listings tied to a specific user.
app.get('/get/listings/:USERNAME/', (req, res) => {
    var userListings = mongoose.model('User', UserSchema);
    userListings.find({username: req.params.USERNAME})
    .exec(function(error, results) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(results[0].listings, null, 4));
    })
  });

// This route returns all the purchases tied to a specific user.  
app.get('/get/purchases/:USERNAME/', (req, res) => {
    var userPurchases = mongoose.model('User', UserSchema);
    userPurchases.find({username: req.params.USERNAME})
    .exec(function(error, results) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(results[0].purchases, null, 4));
    })
  });

// This route returns all the users whose username has the
// "KEYWORD" string in it.  
app.get('/search/users/:KEYWORD/', (req, res) => {
    var userCollection = mongoose.model('User', UserSchema);
    userCollection.find({})
    .exec(function(error, results) {
      var correctResult = [];
      for (i =0; i < results.length; i++) {
        if (results[i].username.includes(req.params.KEYWORD)){
          correctResult.push(results[i]);
        }
      }
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(correctResult, null, 4));
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
      res.setHeader('Content-Type', 'text/plain');
      res.send(JSON.stringify(correctResult, null, 4));
    })
  });

// This route adds a new user to the database.  
app.post('/add/user/', (req, res) => {
    let userObject = JSON.parse(req.body.user);
    var user = new User(userObject);
    console.log(user);
    user.save(function (err) { if (err) console.log('An error occurred'); });
    res.send('Successfully posted');
  });

// This route adds a new item to the database as well as adds the item
// to the listing of the specific user.  
app.post('/add/item/:USERNAME/', (req, res) => {
    let itemObject = JSON.parse(req.body.item);
    var item = new Item(itemObject);
    console.log(item);
    var user = mongoose.model('User', UserSchema);
    user.find({username: req.params.USERNAME})
    .exec(function(error, results) {
      results[0].listings.push(item._id);
      results[0].save(function (err) { if (err) console.log('An error occurred'); });
    })
    item.save(function (err) { if (err) console.log('An error occurred'); });
    res.send('Successfully posted');
  });






const port = 80;
app.listen(port, () => {
    console.log('Server has started');
});