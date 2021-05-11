/*
Name: Dillon Barr
File: myscript.jsx
Course: CSC 337 web Programming
Purpose: This file contains the javascript used for PA5. There are functions to update the text displayed, shuffle the text using the
update square button, change the scale of the Caesar cipher, and a clear button.

I wasn't sure about this code out of methods however I wanted the arrays to be global as well as the slider
value and ran into issues when I tried to put them in methods. Any and all feedback would be greatly appreaciated.
I know the clear button wasn't required but I didn't know how to handle backspaces and ran out of time to research it
so this was my workaround.
*/


scramble = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y'];

slider = document.getElementById("shuffleRange");
output = document.getElementById("slideValue");
output.innerHTML = slider.value;


slider.oninput = function() {
  output.innerHTML = this.value;
  if (document.getElementById("sideInput").value.length > 0) {
    document.getElementById("top").innerHTML = "";
    for (character of document.getElementById("sideInput").value) {
        document.getElementById("top").innerHTML += caeserScramble(character);
    }
  }
}


  
function updateTable() {
    var counter = 0;
    var random = shuffle(scramble);
    var table = document.getElementsByTagName("td");
    for (var i=0; i < table.length; i++) {
        table[i].innerHTML = scramble[counter];
        counter++;
    }
    if (document.getElementById("sideInput").value.length > 0) {
        document.getElementById("bottom").innerHTML = "";
        for (character of document.getElementById("sideInput").value) {
            document.getElementById("bottom").innerHTML += squareCipher(character);
        }
    }
}

function shuffle(scramble) {
    for (let i = scramble.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i+1));
        [scramble[i], scramble[j]] = [scramble[j], scramble[i]];
    }
}

function readText() {
    inputText = document.getElementById("sideInput").value;
    document.getElementById("top").innerHTML += caeserScramble(inputText.substr(inputText.length-1));
    document.getElementById("bottom").innerHTML += squareCipher(inputText.substr(inputText.length-1));
    }

function caeserScramble(inputText) {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    if (alphabet.includes(inputText.toLowerCase())) {
      var index = alphabet.indexOf(inputText);
        return alphabet[(index + Number(slider.value)) % 26];
    }
    else {
        return inputText;
    }
}

function squareCipher(inputText) {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y'];
    if (alphabet.includes(inputText.toLowerCase())) {
        var index = alphabet.indexOf(inputText);
        return scramble[index];
    }
    else {
        return inputText;
    }
}

function clearText() {
    document.getElementById("top").innerHTML = "";
    document.getElementById("bottom").innerHTML = "";
    document.getElementById("sideInput").value = "";
}