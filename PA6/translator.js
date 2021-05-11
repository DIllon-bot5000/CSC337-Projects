/*
Name: Dillon Barr
File: translator.jsx
Course: CSC 337 web Programming
Purpose: This file contains the javascript used for PA6 Translate. It creates a local web server using the http protocol, 
opens, reads and stores two files, and then responds to various path requests in the URL with different translations depending
on the specified path. 

I realize I should of put the result calculating part of this program into its own separate method but I ran out of time. 
*/



const http = require('http');
const fs = require('fs');
const hostname = '127.0.0.1';
const port = 5000;

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
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    var path = req.url.split('/');
    
    if (path[1] == 'translate') {
        if (path[2] == 'e2s') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i++) {
                output += eng2span[toTrans[i]];
                output += ' ';
            }
            res.end(output);
        }
        else if (path[2] == 's2e') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i++) {
                output += span2eng[toTrans[i]];
                output += ' ';
            }
            res.end(output);
        }
        else if (path[2] == 'e2g') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i++) {
                output += eng2germ[toTrans[i]];
                output += ' ';
            }
            res.end(output);
        }
        else if (path[2] == 'g2e') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i++) {
                output += germ2eng[toTrans[i]];
                output += ' ';
            }
            res.end(output);
        }
        else if (path[2] == 'g2s') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i ++) {
                let engWord = germ2eng[toTrans[i]];
                output += eng2span[engWord];
                output += ' ';
            }
            res.end(output);
        }
        else if (path[2] == 's2g') {
            var toTrans = path[3].split('+');
            var output = '';
            for (i = 0; i < toTrans.length; i ++) {
                let engWord = span2eng[toTrans[i]];
                output += eng2germ[engWord];
                output += ' ';
            }
            res.end(output);
        }
    }
    else {
        res.end('OK');
    }
    
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
