/*
Name: Dillon Barr
File: translatorFunctions.js
Class: CSC 337
Purpose: This file uses XMLHttp requests called on the keyup action and is supposed to actively translate the input text on the
translator website. I ran into problems where the response would be undefined and I tried different checks so that rather than undefined 
I would get the "?" as stated in the spec but it never worked. I also encountered an error using backspace to remove text and I don't think my
URL was updating properly. Any insight you can give will be greatly appeciated!
*/

function saveData() {
    var inputLanguage = document.getElementById("inputLanguage");
    var inputSelect = inputLanguage.options[inputLanguage.selectedIndex].value;
    var outputLanguage = document.getElementById("outputLanguage");
    var outputSelect = outputLanguage.options[outputLanguage.selectedIndex].value;
    var inputText = document.getElementById("inputArea").value;
    var langs = inputSelect + "2" + outputSelect;
    inputText = inputText.replace(" ", "+");
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log(httpRequest.responseText);
                let output = document.getElementById("outputArea");
                if (httpRequest.responseText === "undefined") {
                    output.innerText = "?";
                }
                else {
                    output.innerText = httpRequest.responseText;  
                }
            
            } else { alert('ERROR'); }
        }
    }

    let url = 'http://localhost:3000/translate/'+langs+'/'+inputText;
    httpRequest.open('GET', url);
    httpRequest.send();
    }