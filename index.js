var express = require("express");
var app = express();
var path = require("path");


app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, "index.html"));
});

var port = 8080;
app.listen(port , function() {
    console.log("Hello, world!");
});
