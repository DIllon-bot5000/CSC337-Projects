/*
Name: Dillon Barr
File: ostaaFunctions.js
Course: CSC 337
Purpose: This file contains the Javascript used for the Ostaa web applications. This includes
a function to get the information about an item input by the user and send it to the server for 
storage as well as a similar function used to create a new user in the database as well. Both functions
use JQuery to interact with the DOM and send the information to the server.
*/


function addItem() {
    let itemTitle = $('#title').val();
    let itemDes = $('#desc').val();
    let itemImage = $('#image').val();
    let itemPrice = $('#price').val();
    let itemStatus = $('#status').val();
    let itemSeller = $('#seller').val();
    let newItem = {title: itemTitle, description: itemDes, image: itemImage, price: itemPrice, stat: itemStatus}
    let itemObj = JSON.stringify(newItem);
    $.ajax({
        url: '/add/item/'+itemSeller,
        data: {item: itemObj},
        method: 'POST',
        success: function(result) {
            alert('Item posted!');
        }
    })
}

function addUser() {
    let user = $('#username').val();
    let pw = $('#password').val();
    let newUser = {username: user, password: pw, listings: [], purchases: []}
    let userObj = JSON.stringify(newUser);
    $.ajax({
        url: '/add/user/',
        data: {user: userObj},
        method: 'POST',
        success: function(result) {
            alert('User added!');
        }
    })
}   