var express = require("express");
var app = express();
var path = require("path");
var socketIO = require("socket.io");


app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 8080;
const server = app.listen(port , () => {
    console.log("Hello, world!");
    console.log(`Listening on port ${port}`);
});


const io = socketIO(server);

io.on( "connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
});

setInterval(
    () => io.emit("time", new Date().toTimeString()),
    1000
);
