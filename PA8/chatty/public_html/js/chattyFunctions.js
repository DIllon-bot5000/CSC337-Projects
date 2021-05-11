/*
Name: Dillon Barr
File: chattyFunctions.js
Course: CSC 337
Purpose: This file contains the javascript used for the primary functions of the Chatty program
which are sending messages to the server and getting messages from the server to be displayed
*/


// This function opens an AJAX request and using JSON sends the users alias, message
// and time off to the server to be stored for later use.
function sendMessage() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                
            } else { alert('ERROR'); }
        }
    }
    let a = document.getElementById('alias').value;
    let m = document.getElementById('message').value;
    let today = new Date();
    let number = today.getTime();
    let url = '/chats/post';
    let chat = {time: number, alias: a, message: m}
    let messageString = JSON.stringify(chat);
    let params = 'message=' + messageString;
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(params);
    document.getElementById('message').value = '';
}


// This function runs every one second and requests the message data saved on the server. Once recieved the 
// function displays the entire message history in the output area of the Chatty application.
function updateChat() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                let outputArea = document.getElementById('output');
                let results = JSON.parse(httpRequest.responseText);
                let output = '';
                for (i in results) {
                    output += '<b>' + results[i].alias + '</b>: ' + results[i].message + '<br/><br/>';
                }
                outputArea.innerHTML = output;
            } else { alert('ERROR'); }
        }
    }
    let url = '/chats';
    httpRequest.open('GET', url);
    httpRequest.send();
}