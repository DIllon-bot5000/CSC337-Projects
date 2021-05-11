/*
Name: Dillon Barr
File: final.js
Course: CSC 337
Assignemt: Final Project
Purpose: This file contains all the Javascript used in the final project assigment
for the class. Above each function is a description of what the function does.
*/

// This function sends the new user account info to the server
// to create a new account.
function addUser() {
    let user = $('#username').val();
    let pw = $('#password').val();
    let abtMe = $('#aboutMe').val();
    let privacy = $('input[name = security]:checked', '.inputArea').val();
    if (privacy == "true") {
        privacy = true;
    }
    else {
        privacy = false;
    }
    let newUser = {username: user, password: pw, bio: abtMe, reviewedGames: [], createdThreads: [], commentedThreads: [], public: privacy}
    let userObj = JSON.stringify(newUser);
    $.ajax({
        url: '/add/user/',
        data: {user: userObj},
        method: 'POST',
        success: function(result) {
            if (result == 'Successfully posted') {
                alert('Account created!');
            }
            else {
                alert('Username taken, try a different name!');
            }
        }
    })
}

// This function sends the user login information to the server
// to be verified. With a successful verification the page redirects
// to the home page.
function login() {
    let user = $('#username').val();
    let pw = $('#password').val();
    $.ajax({
        url: '/login/' + user + '/' + pw,
        method: 'GET',
        success: function(result) {
            if (result == 'Success') {
                $('#loginBox').html('<a href = "userPage.html">View Profile</a>');
            }
            else {
                alert("Invalid credentials, try again!");
            }
        }
    })
}


// This function gathers the information needed for a new post and
// send the information to the server to be posted.
function postThread() {
    let nTitle = $('#title').val();
    let thread = $('#post').val();
    let nTime = Date.now();
    let newPost = {title: nTitle, post: thread, time: nTime}
    let post = JSON.stringify(newPost);
    $.ajax({
        url: '/post/thread/',
        data: {thread : post},
        method: 'POST',
        success: function(result) {
            if (result == 'Success') {
                alert('Thread created!');
            }
            else {
                alert('An error occurred, a thread may exist with that title already or you need to log in!');
            }
        }
    })
}

// This function is used to send a search request to the server to 
// either search for a thread with a title matching the search term or
// a user with that username
function search() {
    let item = $('#searchBar').val();
    let type = $('#filter').val();
    $.ajax({
        url: '/search/' + item + '/' + type,
        method: 'GET',
        success: function(result) {
            $('#threadsArea').empty();
            console.log(result);
            let newDiv = '';
            for (i = 0; i < result.length; i++) {
                if (type == 'threads') {
                    newDiv += '<div class = "threads">' + '<h3><a href="viewThread.html?name = ' + result[i] +'">' + result[i] + '</a></h3><br>'
                    $('#threadsArea').append(newDiv);
                    //$('#threadsArea').append('<br>');
                }
                else {
                    newDiv += '<div class = "threads">' + '<h3><a href="otherUsersPage.html?name=' + result[i] +'">' + result[i] + '</a></h3>'
                    $('#threadsArea').append(newDiv);
                    $('#threadsArea').append('<br>');
                }
                
            }
        }
    })
}

// This function sends a request to the server to get threads and posts them on the homepage
// as a link to the thread.
function viewThreads() {
    let type = $('#filter').val();
    $.ajax({
        url: '/get/threads/' + type,
        method: 'GET',
        success: function(result) {
            let newResult = JSON.parse(result);
            let newDiv = '';
            $('#threadsArea').empty();
            for (i = 0; i < newResult.length; i++) {
                console.log(newResult.length);
                let title = newResult[i]["title"];
                info = title;
                newDiv += '<div class = "threads">' + '<h3><a href="viewThread.html?name=' + info +'">' + newResult[i]["title"] + '</a></h3>'
            }
            $('#threadsArea').append(newDiv);
            $('threadsArea').append('<br>');
        }
    })
}

// This function is called when a thread link is clicked on to load the thread details
// on to the page.
function loadThread() {
    var url = document.location.href;
    var testing = url.split('=')[1].split('%20');
    console.log(testing)
    var strTitle = testing.toString().replace(/,/g, ' ');
    console.log(strTitle);
    $.ajax({
        url: '/get/thread/' +strTitle,
        method: 'GET',
        success: function(result) {
            let newResult = JSON.parse(result);
            let newDiv = '';
            for (i = 0; i < newResult.length; i++) {
                console.log(newResult[i]['title']);
                $('#original').html(newResult[i]['title'] + '<br>' + newResult[i]['post']);
                if (newResult[i]['comments'].length > 0) {
                    console.log(newResult[i]['comments'].length);
                    $('#commentBlock').empty();
                    $('#commentBlock').append('Comments:<br>');
                    for (j = 0; j < newResult[i]['comments'].length; j++) {
                        console.log(newResult[i]["comments"][j])
                        newDiv += '<div class = "comments">' + newResult[i]["comments"][j] + '</div><br>';
                        
                    } 
                }    
                $('#commentBlock').append(newDiv);
            }
        }
    })
}

// This function takes the information needed for a comment and send the information
// to the server to be saved.
function comment() {
    var url = document.location.href;
    var testing = url.split('=')[1].split('%20');
    console.log(testing)
    var strTitle = testing.toString().replace(/,/g, ' ');
    console.log(strTitle);
    var commentArr = [];
    var comment = $('#commentArea').val();
    console.log(comment);
    commentArr.push(comment);
    let newComment = {title: strTitle, newComm: commentArr}
    let post = JSON.stringify(newComment);
    $.ajax({
        url: '/post/comment/',
        data: {comment: post},
        method: 'POST',
        success: function(result) {
            console.log(result);
            if (result == 'Ok') {
                alert('Comment posted');
            }
            else {
                alert('An error occurred!');
            }
        }
    })
}

// This function runs when a chatroom is loaded into so that
// chat only contains messages from after you joined the chat.
function loadChat() {
    var url = document.location.href;
    console.log(url);
    splitURL = url.split('=')[1];
    $('#temp').attr("src", splitURL + ".jpg");
    loadTime = Date.now();
}

// This function runs every 2 seconds to update the chatroom with current messages. There
// is also a feature to go straight to a user's profile from their name in chat.
function updateChat() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    $.ajax({
        url: '/get/messages/' + splitURL + '/' + loadTime,
        method: 'GET',
        success: function(results) {
            if (results == 'Bad') {
                alert('You must log in to chat');
            }
            if (results != 'Empty') {
                result = JSON.parse(results);
                $('#main').empty();
                for (i = 0; i < result.length; i++) {
                    console.log(name);
                    if (result[i]["username"] != name) {
                        $('#main').append('<a href = "otherUsersPage.html?name=' + result[i]["username"] + '">' + result[i]["username"] + '</a>: ' + result[i]["message"] + '<br>');
                    }
                    else {
                        $('#main').append('<a href = "userPage.html"' + result[i]["username"] + '">' + result[i]["username"] + '</a>: ' + result[i]["message"] + '<br>');
                    }
                    
                }    
            }
        }
    })
}

// This function takes the information from the page to create a message
// and sends it to the server to be saved.
function sendMessage() {
    let content = $('#messageArea').val();
    let timestamp = Date.now();
    let chat = {chatroom: splitURL, message: content, time: timestamp}
    chatObj = JSON.stringify(chat);
    $.ajax({
        url: '/sendmessage/',
        data: {message: chatObj},
        method: 'POST',
        success: function(result) {
            if (result == 'Bad') {
                alert('You need to be logged in to chat');
            }
            else {
                $('#messageArea').val("");
            }
        }

    })

}

// This function takes the information from the new review page and sends
// it to the server to save it in the database.
function addReview() {
    let gameName = $('#game').val();
    let totalHours = $('#hours').val();
    let gameRev = $('#review').val();
    let gameScore = $('#score').val();
    let timeStamp = Date.now();
    let rev = {game: gameName, hours: totalHours, review: gameRev, score: gameScore, time: timeStamp}
    let revObj = JSON.stringify(rev);
    $.ajax({
        url: '/create/review/',
        data: {review: revObj},
        method: 'POST',
        success: function(result) {
            if (result == 'OK') {
                alert('Review created!')
            }
            else {
                alert('Uh oh something went wrong!')
            }
        }
    })
}

// This function sends a get request to the server to get all the game reviews of the logged in user
// and displays them on the page.
function userReviews() {
    $.ajax({
        url: '/get/userreviews/',
        method: 'GET',
        success: function(results) {
            if (results != 'Bad') {
                $('#output').empty();
                let reviews = JSON.parse(results);
                
                for (i = 0; i < reviews.length; i++) {
                    let newDiv = '';
                    newDiv += '<div class = "reviews">' + '<h3>Game: ' + reviews[i].game + '</h3><br>Hours played: ' + reviews[i]['hours'] +
                    '<br> Score: ' + reviews[i]['score'] + '<br> My review: ' + reviews[i]['review'] +'</div>';
                    $('#output').append(newDiv);
                    $('#output').append('<br>');
                }
            }
            else {
                alert('Oops an error occurred!')
            }
        }
    })
}

// This function sends a get request to the server to get all the game reviews of any other user
// and displays them on the page.
function otherReviews() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    $.ajax({
        url: '/get/otherreviews/' + splitURL,
        method: 'GET',
        success: function(results) {
            if (results.length != 'Bad') {
                $('#output').empty();
                let reviews = JSON.parse(results);
                let newDiv = '';
                for (i = 0; i < reviews.length; i++) {
                    newDiv += '<div class = "reviews">' + '<h3>Game: ' + reviews[i].game + '</h3><br>Hours played: ' + reviews[i]['hours'] +
                    '<br> Score: ' + reviews[i]['score'] + '<br> My review: ' + reviews[i]['review'] +'</div>';
                    $('#output').append(newDiv);
                    $('#output').append('<br>');
                }
            }
            else {
                alert('Oops an error occurred!')
            }
        }
    })
}

// This function sends a get request to the server to get all the created threads of the logged in user
// and displays them on the page.
function userThreads() {
    getUser();
    $.ajax({
        url: '/get/user/threads/',
        method: 'GET',
        success: function(results) {
            $('#output').empty();
            if (results.length != 'Bad') {
                let newDiv = '';
                console.log(results);
                for (i = 0; i < results.length; i++) {
                    newDiv += '<div>' + name +' created a thread: <a href = "viewThread.html?name=' + results[i] + '">' + results[i] + '</a><br>';
                    $('#output').append(newDiv);
                }
            }
        }
    })
}

// This function sends a get request to the server to get all of the commented threads of the logged in user
// and displays them on the page.
function userComments() {
    getUser();
    $.ajax({
        url: '/get/user/comments/',
        method: 'GET',
        success: function(results) {
            if (results.length != 'Bad') {
                let newDiv = '';
                for (i = 0; i < results.length; i++) {
                    newDiv += '<div>' + name +' posted a comment on: <a href = "viewThread.html?name=' + results[i] + '">' + results[i] + '</a><br>';
                    $('#output').append(newDiv);
                }
            }
        }
    })
}

// This function sends a get request to the server to get all the created threads of any other user
// and displays them on the page.
function otherThreads() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    console.log(splitURL);
    $.ajax({
        url: '/get/' + splitURL + '/threads/',
        method: 'GET',
        success: function(results) {
            $('#output').empty();
            if (results.length != 'Bad') {
                let newDiv = '';
                for (i = 0; i < results.length; i++) {
                    newDiv += '<div>' + splitURL +' created a thread: <a href = "viewThread.html?name=' + results[i] + '">' + results[i] + '</a><br>';
                    $('#output').append(newDiv);
                }
            }
        }
    })
}

// This function sends a get request to the server to get all the commented threads of any other user
// and displays them on the page.
function otherComments() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    $.ajax({
        url: '/get/' + splitURL + '/threads/',
        method: 'GET',
        success: function(results) {
            if (results.length != 'Bad') {
                let newDiv = '';
                for (i = 0; i < results.length; i++) {
                    newDiv += '<div>' + splitURL +' posted a comment on: <a href = "viewThread.html?name=' + results[i] + '">' + results[i] + '</a><br>';
                    $('#output').append(newDiv);
                }
            }
        }
    })
}

// This function sends a request to the server and then displays the logged in user's bio on the page.
function userAboutMe() {
    $.ajax({
        url: 'get/user/aboutme',
        method: 'GET',
        success: function(result) {
            if (result.length == 0) {
                alert('An error occurred')
            }
            else {
                $('#output').empty();
                let newDiv = '';
                newDiv += '<div class = "reviews"><h2>' + result + '</h2></div>';
                $('#output').append(newDiv);
            }
        }
    })
}

// This function sends a request to the server and then displays the bio of a profile that is not the users on the page.
function otherAboutMe() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    $.ajax({
        url: 'get/otherBio/' + splitURL,
        method: 'GET',
        success: function(result) {
            if (result.length == 0) {
                alert('An error occurred')
            }
            else {
                $('#output').empty();
                let newDiv = '';
                newDiv += '<div class = "reviews"><h2>' + result + '</h2></div>';
                $('#output').append(newDiv);
            }
        }
    })
}

// This function is called to display a textarea to allow the user to edit their bio.
function editMe() {
    $('#output').empty();
    $('#output').html('<textarea id = "about" rows = "10" cols = "100"></textarea><br><button type = "button" onclick= "edit()" id = "edit">Edit Bio</button>');
}

// This function sends the edited bio to the server to be saved.
function edit() {
    let bio = $('#about').val();
    $.ajax({
        url: '/change/bio/' + bio,
        method: 'POST',
        success: function(result) {
            if (result == 'Ok') {
                alert('About Me updated!')
            }
            else {
                alert('An error occurred.')
            }
        }
    })
}

// This function checks if a user is logged in and if so displays a link to view their profile.
function checkLogin() {
    $.ajax({
        url: '/check/login/',
        method: 'GET',
        success: function(result) {
            if (result == 'Ok') {
                $('#loginBox').html('<a href = "userPage.html">View Profile</a>');
            }
        }
    })
}

// This function shows the number value of the slider when rating a game in a review.
function setSlider() {
    $('#slideValue').html($('#score').val());

}

// This function gets the username of the currently logged in user.
function getUser() {
    $.ajax({
        url: '/get/user/',
        method: 'GET',
        success: function(result) {
            console.log(result);
            name = result;
        }
    })
}

function isPrivate() {
    var url = document.location.href;
    splitURL = url.split('=')[1];
    $.ajax({
        url: '/check/privacy/' + splitURL,
        method: 'GET',
        success: function(result) {
            if (result == 'false') {
                $('#main').empty();
                $('#main').html("This account is private");
            }
        }
    })
}
