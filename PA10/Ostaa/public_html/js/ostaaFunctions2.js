/*
Name: Dillon Barr
File: ostaaFunctions2.js
Course: CSC 337
Purpose: This file contains the Javascript used for the Ostaa web application.
Included are functions for:
    *sending an item to the server to be saved and posted as for sale
    *sending user login credentials to the server for verification
    *updating the user message
    *sending user credentials to the server to create a new account
    *getting listing information from the server and displaying it
    *getting purchase information from the server and displaying it
    *getting items for sale from the server and dispalying it
    *notifying the server that an item has been purchased
*/

// This function takes the input values from the post item page
// and sends the information to the server to to be saved as an item for sale.
function addPosting() {
    let itemTitle = $('#title').val();
    let itemDes = $('#desc').val();
    let itemImage = $('#image').val();
    let itemPrice = $('#price').val();
    let itemStatus = $('#status').val();
    let itemSeller = $('#seller').val();
    let newItem = {title: itemTitle, description: itemDes, image: itemImage, price: itemPrice, stat: itemStatus}
    let itemObj = JSON.stringify(newItem);
    $.ajax({
        url: '/add/item/',
        data: {item: itemObj},
        method: 'POST',
        success: function(result) {
            console.log(result);
            if (result == 'Successfully posted') {
                alert('Item posted!');
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
                window.location.href = './home.html';
            }
            else {
                let output = $('#incorrectCred').html("Invalid credentials, try again!");
            }
        }
    })
}

// This function gets the username from the server to update the greeting message.
function updateMessage() {
    $.ajax({
        url: '/get/user/',
        method: 'GET',
        success: function(result) {
            let output = $('#greeting').html("<h3>Welcome " + result + "! What do you want to do today?</h3>");
        }
    })
}


// This function sends the new user account info to the server
// to create a new account.
function createAccount() {
    let user = $('#nUser').val();
    let pw = $('#nPassword').val();
    let newUser = {username: user, password: pw, listings: [], purchases: []}
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

// This function takes the user info from the search bar and 
// sends a request to the server for items matching
// that description. The html on the right side of the page reflects
// the information recieved from the server.
function searchListings() {
    let item = $('#searchBar').val();
    $('#outputArea').empty();
    $.ajax({
        url: '/search/items/' + item,
        method: 'GET',
        success: function(results) { 
            if (results.length > 0) {
                let newResult = JSON.parse(results);
                let newDiv = '';
                for (i = 0; i < newResult.length; i++) {
                    if (newResult[i]["stat"] == "SALE") {
                        newDiv += '<div class = "items">' + '<h3>' + newResult[i]["title"] + '</h3>' + '<br>' + newResult[i]["image"] + '<br>' 
                        + newResult[i]["description"]+ '<br>' + newResult[i]["price"] + '<br>' + 
                        '<button type = "button" id = "' + newResult[i]["description"] + '" onclick = "purchase(this.id)">Buy Now!</button>' + '<br></div>';
                    }
                    else {
                        newDiv += '<div class = "items">' + '<h3>' + newResult[i]["title"] + '</h3>' + '<br>' + newResult[i]["image"] + '<br>' 
                        + newResult[i]["description"]+ '<br>' + newResult[i]["price"] + '<br>' + 'SOLD!' + '<br></div>';
                    }   
                    $('#outputArea').append(newDiv);
                    $('outputArea') + '<br>';
                }
            }
            else {
                $('#outputArea').empty();
            }
        }
    })
}

// This function asks the server for the purchase information for
// the current user and displays that information on the right hand side of
// the page.
function viewPurchases() {
    $('#outputArea').empty();
    $.ajax({
        url: '/get/purchases/',
        method: 'GET',
        success: function(results) { 
            if (results.length > 0) {
                let newResult = JSON.parse(results);
                let newDiv = '';
                for (i = 0; i < newResult.length; i++) {
                    newDiv += '<div class = "items">' + '<h3>' + newResult[i]["title"] + '</h3>' + '<br>' + newResult[i]["image"] + '<br>' 
                    + newResult[i]["description"]+ '<br>' + newResult[i]["price"] + '<br>' + newResult[i]["stat"] + '<br></div>';
                    $('#outputArea').append(newDiv);
                    $('outputArea') + '<br>';
                    
                }
                
            }
            else {
                $('#outputArea').empty();
            }
        }
    })
}

// This function asks the server for the listings tied to
// the current user and displays that information on the 
// right side of the screen.
function viewListings() {
    $('#outputArea').empty();
    $.ajax({
        url: '/get/listings/',
        method: 'GET',
        success: function(results) { 
            if (results.length > 0) {
                let newResult = JSON.parse(results);
                let newDiv = '';
                for (i = 0; i < newResult.length; i++) {
                    newDiv += '<div class = "items">' + '<h3>' + newResult[i]["title"] + '</h3>' + '<br>' + newResult[i]["image"] + '<br>' 
                    + newResult[i]["description"]+ '<br>' + newResult[i]["price"] + '<br>' + newResult[i]["stat"] + '<br></div>';
                    $('#outputArea').append(newDiv);
                    $('outputArea') + '<br>';
                    
                }
                
            }
            else {
                $('#outputArea').empty();
            }
        }
    })
}

// This function sends the description of an item
// being purchased to the server so it can be updated 
// in the database and added to the user's purchased list.
function purchase(testing) {
    $.ajax({
        url: '/purchase/' + testing,
        method: 'POST',
        success: function(result) {
            if (result == 'OK') {
                alert('item purchased!');
            }
        }
    })
}