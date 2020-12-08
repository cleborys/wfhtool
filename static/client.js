//******************************************************************************
//Load.
//******************************************************************************

const status_ = [
	"Sleeping",
	"Working",
	"Breakfast",
	"Lunch",
	"Sick",
	"Holiday",
	"Feeling lazy"
];

let color_ = new Map();
color_.set("Sleeping", "Grey");
color_.set("Working", "LightGreen");
color_.set("Breakfast", "LightCyan");
color_.set("Lunch", "Tan");
color_.set("Sick", "Tomato");
color_.set("Holiday", "LightBlue");
color_.set("Feeling lazy", "Pink");

let myStatusIndex = 0;
let myName = '';
let token = "";
let statuses = new Map();
const socket = io();

socket.on("all_states", (arr) => {
	console.log("all_states:");
	for(const statusData of arr) {
    statuses.set(statusData.username, statusData.status);
	}
	update();
});

socket.on("state", (statusData) => {
	console.log('Received status update', statusData);
  statuses.set(statusData.username, statusData.status);
	update();
});

socket.on('login_result', (data) => {
	console.log('login result: ', data);
  if (data.success) {
    token = data.token;
    myName = data.username;
	  get("login").innerHTML = "";
	  update();
	  updateTime();
	  socket.emit("set_status", { new_status: status_[myStatusIndex], token: token });
  }
});

function update() {
	if(!token) return;
	var t  = document.createElement('table');
	var r = t.insertRow();
	var c0 = r.insertCell();
	var c1 = r.insertCell();
  c0.innerHTML = myName;
  const myStatus = statuses.get(myName);
  c1.innerHTML = myStatus;
	c1.style.backgroundColor = color_.get(myStatus) || "Grey";
  c1.onclick = function() {
    myStatusIndex = (myStatusIndex + 1) % status_.length;
	  socket.emit("set_status", { new_status: status_[myStatusIndex], token: token });
  };
	r.style.fontSize = "200%"
	statuses.forEach((status, username) => {
		var row = t.insertRow();
		var c0 = row.insertCell();
		var c1 = row.insertCell();
		c0.innerHTML = username;
		c1.innerHTML = status;
		c1.style.backgroundColor = color_.get(status) || "Grey";
	});
	get("t").innerHTML = "";
	get("t").appendChild(t);
}

function login() {
	var name = get("in1").value
	socket.emit("login", { name: name });
	update();
	updateTime();
}

function create() {
	var name = get("in1").value
  console.log('Trying to create user with name', name);
	socket.emit("create_user", { name: name });
}

//******************************************************************************
//Time keeping
//******************************************************************************

function updateTime() {
	if(!token) return;
	var t  = document.createElement('table');

	var r = t.insertRow();
	var c0 = r.insertCell();
	var c1 = r.insertCell();
	c0.innerHTML = "Work today"
	c1.innerHTML = today();

	r = t.insertRow();
	c0 = r.insertCell();
	c1 = r.insertCell();
	c0.innerHTML = "Work this week"
	c1.innerHTML = week();

	get("time").innerHTML = "";
	get("time").appendChild(t);
}

var seconds_today = 0;
var seconds_week = 0;

function today() {
	return timestr(seconds_today);
}

function week() {
	return timestr(seconds_week);
}

function timestr(s) {
	var h = Math.floor(s / 3600);
	s -= 3600*h;
	var m = Math.floor(s / 60);
	s -= 60*m;
	var str = "" + s;
	while(str.length < 2) {
		str = "0" + str;
	}
	str = m + ":" + str;
	while(str.length < 5) {
		str = "0" + str;
	}
	str = h + ":" + str;
	while(str.length < 8) {
		str = "0" + str;
	}
	return str;
}

setInterval(function() {
	if(myStatusIndex != 1) return;
	seconds_today++;
	seconds_week++;
	updateTime();
}, 1000);



//******************************************************************************
//HTML
//******************************************************************************

function get(id) {
	return document.getElementById(id)
}

//******************************************************************************
