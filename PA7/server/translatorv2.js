/*
Name: Dillon Barr
File: translatorv2.js
Course: CSC 337 web Programming
Purpose: This file contains the javascript used for PA7 TranslateV2. It creates a local web server using the express protocol, 
opens, reads and stores two files, and then responds to various path requests in the URL with different translations depending
on the specified path. 

I had a really hard time with the assignment and couldn't get it to work exactly as specified so I would appreciate any and all feedback please
and thank you!
*/



const express = require('express')
const fs      = require('fs');
const app     = express()
const port    = 3000

eng2span = {};
span2eng = {};
eng2germ = {};
germ2eng= {};


// This opens the file containing the English to Spanish
// translations and stores them in corresponding objects
// after stripping some of the unneeded characters and
// doing some string conversion.
fs.readFile('./Spanish.txt', 'utf8', function (err,data) {
    if (err) { return console.log(err); }
        data = data.split("\n");
        for (i = 0; i < data.length; i++) {
            if (!(data[i].startsWith('#'))) {
                line = data[i].split(/[.,'/\t]/);
                if (line.length > 1) {
                    engWord = line[0].toString().toLowerCase();
                    spanWord = line[1].toString().toLowerCase();
                    eng2span[engWord] = [spanWord];
                    span2eng[spanWord] = [engWord];
                }
            }
        }
      });
// This opens the file containing the English to German
// translations and stores them in corresponding objects
// after stripping some of the unneeded characters and
// doing some string conversion.
fs.readFile('./German.txt', 'utf8', function (err,data) {
    if (err) { return console.log(err); }
        data = data.split("\n");
        for (i = 0; i < data.length; i++) {
            if (!(data[i].startsWith('#'))) {
                line = data[i].split('\t');
                if (line.length > 1) {
                    engWord = line[0].toString().toLowerCase();
                    germWord = line[1].toString().toLowerCase();
                    eng2germ[engWord] = [germWord];
                    germ2eng[germWord] = [engWord];
                }
            }     
            }
      });

// Inside this block of code the server is created and after
// doing some splitting and checking on the URL path the desired 
// results are displayed to the user. This section should of 
// be split into other functions but again I ran out of time.  
app.use(express.static('public_html'))

app.get('/:command/:langs/:textToTranslate', (req, res) => {
    var command = req.params.command;
    var langs = req.params.langs;
    var text = req.params.textToTranslate;
    var outputText;

    if (langs == 'e2s') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i++) {
            outputText += eng2span[toTrans[i]];
            outputText += ' ';
        }
        res.send(outputText);
    }
    else if (langs == 's2e') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i++) {
            outputText += span2eng[toTrans[i]];
            outputText += ' ';
        }
        res.send(outputText);
    }
    else if (langs == 'e2g') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i++) {
            outputText += eng2germ[toTrans[i]];
            outputText += ' ';
        }
        res.send(outputText);
    }
    else if (langs == 'g2e') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i++) {
            outputText += germ2eng[toTrans[i]];
            outputText += ' ';
        }
        res.send(outputText);
    }
    else if (langs == 'g2s') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i ++) {
            let engWord = germ2eng[toTrans[i]];
            outputText += eng2span[engWord];
            outputText += ' ';
        }
        res.send(outputText);
    }
    else if (langs == 's2g') {
        var toTrans = text.split('+');
        var outputText = '';
        for (i = 0; i < toTrans.length; i ++) {
            let engWord = span2eng[toTrans[i]];
            outputText += eng2germ[engWord];
            outputText += ' ';
        }
        res.send(outputText);
    }

});
app.listen(port, () =>
    console.log('App listening'))
    
