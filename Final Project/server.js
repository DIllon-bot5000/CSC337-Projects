/*
Name: Dillon Bar
File: server.js
Course: CSC 337
Assignment: Final Project
Purpose: This file sets up the server used for the final project and the various routes that need
to be handled for the application to work. Above each route there is a description about what
each route does.
*/

const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.use(cookieParser());

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/final';
const iterations = 1000;
var sessionKeys = {};

// This function checks the keys within sessionKeys to see
// if they are still valid and if not they are removed from
// the collection.
function updateSessions() {
    let now = Date.now();
    for (e in sessionKeys) {
        if (sessionKeys[e][1] < now - 600000) {
            delete sessionKeys[e];
        }
    }
}

setInterval(updateSessions, 2000);

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    salt: String,
    hash: String,
    bio: String,
    reviewedGames: [],
    createdThreads: [],
    commentedThreads: [],
    public: Boolean
  });
var User = mongoose.model('User', UserSchema );

var MessageSchema = new Schema({
    time: Number,
    username: String,
    message: String,
    chatroom: String
});
var Message = mongoose.model('Message', MessageSchema);

var RevSchema = new Schema({
    username: String,
    game: String,
    time: Number,
    review: String,
    hours: Number,
    score: Number
});
var Review = mongoose.model('Review', RevSchema);

var ThreadSchema = new Schema({
    author: String,
    title: String,
    post: String,
    time: Number,
    comments: []
});
var Thread = mongoose.model('Thread', ThreadSchema);

app.use('/index.html', express.static('public_html/index'));
app.use('/', express.static('public_html'));


mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// This function checks if the user has a valid key tied to their cookies
// and if not redirects to the login page to log in again.
function authenticate (req, res) {
    if (typeof req === 'undefined') {
        return 'Bad';
    }
    else {
        if (Object.keys(req.cookies).length > 0) {
        let u = req.cookies.login.username;
        let key = req.cookies.login.key;
        if (Object.keys(sessionKeys[u]).length > 0 && sessionKeys[u][0] == key) {
            return;
        }
        else {
          return 'Bad';
        }
    }
    else {
        return 'Bad';
    }
    }
}

// This route creates a new user in the database if the desired username
// is not already taken. When create a user a new salt and hash is created for
// stronger security practices.
app.post('/add/user/', (req, res) => {
    let userObject = JSON.parse(req.body.user);
    User.find({username: userObject['username']})
    .exec(function(error, results) {
        if (results.length > 0){
            res.send('Bad');
        }
        else {
            var salt = crypto.randomBytes(64).toString('base64');
            crypto.pbkdf2(userObject['password'], salt, iterations, 64, 'sha512', (err, hash) => {
                if (err) throw err;
                userObject['salt'] = salt;
                userObject['hash'] = hash.toString('base64');
                delete userObject.password;
                var user = new User(userObject);
                user.save(function (err) { if (err) console.log('An error occurred'); });
                res.send('Successfully posted');
            }) 
        }
    })
    
  });

// This route handles creating a new thread. It checks if a thread with that name
// does not exist a new thread is created in the database and the thread title
// is added to the user's createdThreads array. 
app.post('/post/thread/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let threadObj = JSON.parse(req.body.thread);
        threadObj['username'] = req.cookies.login.username;
        var thread = new Thread(threadObj);
        Thread.find({title: thread.title})
        .exec(function(error, results) {
            if (results.lenth > 0) {
                res.send('Bad')
            }
            else {
                thread.save(function (err) { if (err) console.log('Error'); });
                User.find({username: req.cookies.login.username})
                .exec(function(error, results) {
                    results[0].createdThreads.push(thread.title);
                    results[0].save(function (err) { if (err) console.log('Error'); });
                    res.send('Success');
                })
            }
    })    
    }
    else {
        res.send('Bad');
    }
   
})

// This route handles getting the threads to display on the homepage
app.get('/get/threads/:TYPE', (req, res) => {
    Thread.find({})
    .exec(function(error, results){
        res.send(JSON.stringify(results));
    })
})

// This route is used to get a specific thread that has been clicked on in the application.
// It sends back the object to be displayed on the viewThread page.
app.get('/get/thread/:INFO', (req, res)=> {
    console.log(req.params.INFO);
    Thread.find({title: req.params.INFO})
    .exec(function(error, results) {
        res.send(JSON.stringify(results));
    })
})

// This route handles when the user searches for a thread or
// user on the homepage and returns the search results
app.get('/search/:INFO/:TYPE', (req, res) => {
    let matches = [];
    if (req.params.TYPE == 'threads') {
        Thread.find({title: req.params.INFO})
        .exec(function(error, results) {
            for (i = 0; i < results.length; i++) {
                matches.push(results[i]['title']);
            }
            res.send(matches);
        })
    }
    else {
        User.find({username: req.params.INFO})
        .exec(function(error, results) {
        for (i = 0; i < results.length; i++) {
            matches.push(results[i]['username']);
        }
        res.send(matches);
        })
    }
})

// This route handles when the user creates a new comment to be added to a thread. It finds
// the correct thread to add the comment to and also adds the comment to the user's commentedThreads
// array
app.post('/post/comment/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let commentObj = JSON.parse(req.body.comment);
        let oldTitle = commentObj['title'];
        let comment = commentObj['newComm'];
        console.log(oldTitle);
        Thread.find({title: oldTitle})
        .exec(function(error, result) {
        console.log(result[0])
        result[0]["comments"].push(comment);
        result[0].save(function (err) { if (err) console.log('Error'); });
        User.find({username: req.cookies.login.username})
        .exec(function(error, results) {
            results[0].commentedThreads.push(commentObj.title);
            results[0].save(function (err) { if (err) console.log('Error'); });
            res.send('Ok');
        })
    })
    }
    else {
        res.send('Bad');
    }
    
})

// This route checks if a user exists in the database and if so creates a session
// and allows the user to log in. This route also uses salting and hashing for 
// added security.
app.get('/login/:USERNAME/:PASSWORD/', (req, res) => {
    let user = req.params.USERNAME;
    
    User.find({username: user})
    .exec(function(error, results) {
        if (results.length == 1) {
            let pw = req.params.PASSWORD;
            var salt = results[0].salt;
            crypto.pbkdf2(pw, salt, iterations, 64, 'sha512', (err, hash) => {
                if (err) throw err;
                let hashStr = hash.toString('base64');
                if (results[0].hash = hashStr) {
                    let sessionKey = Math.floor(Math.random() * 1000);
                    sessionKeys[user] = [sessionKey, Date.now()];
                    res.cookie("login", {username: user, key: sessionKey}, {maxAge: 600000});
                    res.send('Success');
                }
            })
            
        }
        else {
            res.send('NOT ALLOWED');
        }
    });
  });

  // This route returns the username of the logged in user.
app.get('/get/user/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        res.send(req.cookies.login.username);
      }
    else {
        res.send('Bad');
      }
})

// This route takes a message from the application and adds it to the database
app.post('/sendmessage/', (req, res) => {
    if (authenticate(req, res) != 'Bad') {
        let mess = JSON.parse(req.body.message);
        mess['username'] = req.cookies.login.username;
        var message = new Message(mess);
        message.save(function (err) { if (err) console.log('An error occurred'); });
        res.send('Success');
    }
    else {
        res.send('Bad');
    }
})

// This route gets the messages for a specific chatroom and after the specified
// time and sends them back to be displayed
app.get('/get/messages/:ROOM/:TIME', (req, res) => {
    Message.find({chatroom: req.params.ROOM})
    .exec(function(error, results) {
        timeRes = [];
        if (results.length > 0) {
            for (i = 0; i < results.length; i++) {
                if (results[i]['time'] > req.params.TIME) {
                    timeRes.push(results[i]);
                }
            }
            res.send(JSON.stringify(timeRes));    
        }
        else {
            res.send('Empty');
        }
        
    })
})

// This route takes a request for a new game request and creates a new review in
// the database and adds it to the user's reviewedGames array.
app.post('/create/review/', (req, res) => {
    let review = JSON.parse(req.body.review);
    let user = req.cookies.login.username;
    User.find({username : user})
    .exec(function(error, results) {
        if (results[0].reviewedGames.includes(review.name)) {
            res.send('Bad');
        }
        else {
            review.username = user;
            let newRev = new Review(review);
            newRev.save(function (err) { if (err) console.log('An error occurred'); });
            results[0].reviewedGames.push(review);
            results[0].save(function (err) { if (err) console.log('An error occurred'); });
            res.send('OK');
        }
    })
})

// This route gets the reviews for a non logged in user to be displayed on their
// reviews tab on their profile.
app.get('/get/userreviews/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let user = req.cookies.login.username;
        Review.find({username : user})
        .exec(function(error, results) {
            if (results.length == 0) {
                res.send('Bad');
            }
            else {
                res.send(JSON.stringify(results));
            }
    })
    }
})

// This route gets the reviews for a non logged in user to be displayed on their
// reviews tab on their profile.
app.get('/get/otherreviews/:USER', (req, res) => {
    let user = req.params.USER
    Review.find({username : user})
    .exec(function(error, results) {
        if (results.length == 0) {
            res.send('Bad');
        }
        else {
            res.send(JSON.stringify(results));
        }
    })
})

// This route gets the bio for a logged in user to be displayed on their
// about me tab on their profile.
app.get('/get/user/aboutme/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let user = req.cookies.login.username;
        User.find({username: user})
        .exec(function(error, results) {
            res.send(results[0].bio);
        })
    
    }
    else {
        res.send('Bad');
    }
})

// This route gets the bio for a non logged in user to be displayed on their
// about me tab on their profile.
app.get('/get/otherBio/:USER/', (req, res) => {
        let user = req.params.USER;
        User.find({username: user})
        .exec(function(error, results) {
            res.send(results[0].bio);
        })
})

// This route is used when the user edits their bio and saves the new bio to the 
// user in the database.
app.post('/change/bio/:BIO', (req, res) =>{
    let bio = req.params.BIO;
    let user = req.cookies.login.username;
    User.find({username : user})
    .exec(function(error, results) {
        results[0].bio = bio;
        results[0].save(function (err) { if (err) console.log('An error occurred'); });
        res.send('Ok');
    })
})


// This route gets the threads for a logged in user to be displayed on their
// activity tab on their profile.
app.get('/get/user/threads/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let user = req.cookies.login.username;
        User.find({username: user})
        .exec(function(error, results) {
            res.send(results[0].createdThreads);
        })
    
    }
    else {
        res.send('Bad');
    }
})

// This route gets the comments for a logged in user to be displayed on their
// activity tab on their profile.
app.get('/get/user/comments/', (req, res) => {
    if (authenticate(req) != 'Bad') {
        let user = req.cookies.login.username;
        User.find({username: user})
        .exec(function(error, results) {
            res.send(results[0].commentedThreads);
        })
    
    }
    else {
        res.send('Bad');
    }
})

// This route gets the threads for a non logged in user to be displayed on their
// activity tab on their profile.
app.get('/get/:USER/threads/', (req, res) => {
    let user = req.params.USER;
    User.find({username: user})
    .exec(function(error, results) {
        res.send(results[0].createdThreads);
        })
})

// This route gets the comments for a non logged in user to be displayed on their
// activity tab on their profile.
app.get('/get/:USER/comments/', (req, res) => {
    let user = req.params.USER;
    User.find({username: user})
    .exec(function(error, results) {
        res.send(results[0].commentedThreads);
        })
})

// This route checks to see if a user is still logged in
// and if not responds with 'Bad'
app.get('/check/login', (req, res) => {
    if (authenticate(req) != 'Bad') {
        res.send('Ok');
    }
})

app.get('/check/privacy/:USER', (req, res) => {
    User.find({username: req.params.USER})
    .exec(function(error, results) {
        if (results[0].public == false) {
            res.send('false');
        }
        else {
            res.send('Ok');
        }
        })
})

const port = 80;
app.listen(port, () => {
    console.log('Server has started');
});

