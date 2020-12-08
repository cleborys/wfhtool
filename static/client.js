//* *****************************************************************************
// Load.
//* *****************************************************************************

const status_ = [
  'Sleeping',
  'Working',
  'Breakfast',
  'Lunch',
  'Sick',
  'Holiday',
  'Feeling lazy',
];

const color_ = new Map();
color_.set('Sleeping', 'LightBlue');
color_.set('Working', 'LightGreen');
color_.set('Breakfast', 'LightCyan');
color_.set('Lunch', 'Tan');
color_.set('Sick', 'Tomato');
color_.set('Holiday', 'LightBlue');
color_.set('Feeling lazy', 'Pink');

let myStatusIndex = 0;
let myName = '';
let token = '';
const statuses = new Map();
const socket = io();

socket.on('all_states', (arr) => {
  console.log('all_states:');
  for (const statusData of arr) {
    statuses.set(statusData.username, statusData.status);
  }
  update();
});

socket.on('state', (statusData) => {
  console.log('Received status update', statusData);
  statuses.set(statusData.username, statusData.status);
  update();
});

socket.on('login_result', (data) => {
  console.log('login result: ', data);
  if (data.success) {
    token = data.token;
    myName = data.username;
    update();
    updateTime();
    socket.emit('set_status', {new_status: status_[myStatusIndex], token: token});
  }
});

function update() {
  if (!token) return;
  const t = document.createElement('table');
  const r = t.insertRow();
  const c0 = r.insertCell();
  const c1 = r.insertCell();
  c0.innerHTML = myName;
  const myStatus = statuses.get(myName);
  c1.innerHTML = myStatus;
  c1.style.backgroundColor = color_.get(myStatus) || 'LightBlue';
  c1.onclick = function() {
    myStatusIndex = (myStatusIndex + 1) % status_.length;
    socket.emit('set_status', {new_status: status_[myStatusIndex], token: token});
  };
  r.style.fontSize = '200%';
  statuses.forEach((status, username) => {
    if (username === myName) {
      return;
    }
    const row = t.insertRow();
    const c0 = row.insertCell();
    const c1 = row.insertCell();
    c0.innerHTML = username;
    c1.innerHTML = status;
    c1.style.backgroundColor = color_.get(status) || 'LightBlue';
  });
  get('t').innerHTML = '';
  get('t').appendChild(t);
}

function login() {
  const name = get('in1').value;
  socket.emit('login', {name: name});
  update();
  updateTime();
}

function create() {
  const name = get('in1').value;
  console.log('Trying to create user with name', name);
  socket.emit('create_user', {name: name});
}

//* *****************************************************************************
// Time keeping
//* *****************************************************************************

function updateTime() {
  if (!token) return;
  const t = document.createElement('table');

  let r = t.insertRow();
  let c0 = r.insertCell();
  let c1 = r.insertCell();
  c0.innerHTML = 'Work today';
  c1.innerHTML = today();

  r = t.insertRow();
  c0 = r.insertCell();
  c1 = r.insertCell();
  c0.innerHTML = 'Work this week';
  c1.innerHTML = week();

  get('time').innerHTML = '';
  get('time').appendChild(t);
}

let seconds_today = 0;
let seconds_week = 0;

function today() {
  return timestr(seconds_today);
}

function week() {
  return timestr(seconds_week);
}

function timestr(s) {
  const h = Math.floor(s / 3600);
  s -= 3600*h;
  const m = Math.floor(s / 60);
  s -= 60*m;
  let str = '' + s;
  while (str.length < 2) {
    str = '0' + str;
  }
  str = m + ':' + str;
  while (str.length < 5) {
    str = '0' + str;
  }
  str = h + ':' + str;
  while (str.length < 8) {
    str = '0' + str;
  }
  return str;
}

setInterval(function() {
  if (myStatusIndex != 1) return;
  seconds_today++;
  seconds_week++;
  updateTime();
}, 1000);


//* *****************************************************************************
// HTML
//* *****************************************************************************

function get(id) {
  return document.getElementById(id);
}

//* *****************************************************************************

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="react-rendered">
        <LoginForm />
      </div>
    );
  }
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {username: null, password: null, visible: true};

    this.changeName = this.changeName.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);

    socket.on('login_result', (data) => {
      if (data.success) {
        this.setState({visible: false});
      }
    });
  }

  changeName(event) {
    this.setState({username: event.target.value});
  }
  changePassword(event) {
    this.setState({password: event.target.value});
  }

  handleSignIn(event) {
    socket.emit('login', {name: this.state.username});
  }
  handleSignUp(event) {
    socket.emit('create_user', {name: this.state.username});
  }

  render() {
    if (!this.state.visible) {
      return (
        <div></div>
      );
    }

    return (
      <div id="loginPanel" className="panel panel-default">
        <div className="panel-heading">
          <h2 className="panel-title">Login</h2>
        </div>
        <div className="panel-body">
          <div style={{padding: '60px 30px'}}>
            <form>
              <div className="form-horizontal">
                <input type="text" className="form-control" id="inputUserName"
                  placeholder="username" onChange={this.changeName}/>
                <input type="text" className="form-control" id="inputPassword"
                  placeholder="password" onChange={this.changePassword}/>
              </div>
            </form>
            <br/>
            <div className="btn-toolbar" role="toolbar">
              <button className="btn btn-primary" onClick={this.handleSignUp}>Sign up</button>
              <button className="btn btn-primary" onClick={this.handleSignIn}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

ReactDOM.render(
    <App />,
    document.getElementById('reactDOM'),
);
