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

var users = new Map();

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
	socket.on("set_status", (user, token) => {
		// check token...
		users.set(user.id, user);
		socket.broadcast.emit("state", user);
	});
	socket.on("login", (user) => {
		users.set(user.id, user);
		socket.emit("login_result", {token: "123"});
		var all = [];
		users.forEach((user, id) => {
			all.push(user);
		});
		socket.emit("all_states", all);
	});
});
