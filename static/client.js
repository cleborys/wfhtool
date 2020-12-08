//* *****************************************************************************
// Globals
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

let myStatusIndex = 1;
let myName = '';
let token = '';
const socket = io();

socket.on('login_result', (data) => {
  console.log('login result: ', data);
  if (data.success) {
    token = data.token;
    myName = data.username;
    socket.emit('set_status', {new_status: status_[myStatusIndex], token: token});
  }
});


//* *****************************************************************************
// Time keeping
//* *****************************************************************************

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

//* *****************************************************************************
// React
//* *****************************************************************************

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {loggedIn: false};

    socket.on('login_result', (data) => {
      if (data.success) {
        this.setState({loggedIn: true});
      }
      console.log(this.state);
    });
    console.log(this.state);
  }

  render() {
    if (!this.state.loggedIn) {
      return (
        <div id="react-rendered">

          <div className="container" style={{padding: '60px 30px'}}>
            <div className="row">
              <div className="col-lg"></div>
              <div className="col-lg">
                <h1> WFH Status Tool </h1>
                <LoginForm />
              </div>
              <div className="col-lg"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="react-rendered">

        <div className="container" style={{padding: '30px 30px'}}>
        <h1> WFH Status Tool </h1>
          <div className="row">
            <div className="col-lg">
              <div className="row">
                <div className="col-sm">

                  <div className="card border-primary mb-3">
                    <div className="card-header">My Status</div>
                    <div className="card-body">
                      <StatusControl />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm">

                  <div className="card border-primary mb-3">
                    <div className="card-header">Timers</div>
                    <div className="card-body">
                      <Timers />
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="col-lg">

              <div className="card border-primary mb-3">
                <div className="card-header">Status list</div>
                <div className="card-body">
                  <StatusTable />
                </div>
              </div>
            </div>
          </div>
        </div>

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

class StatusTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {statusMap: new Map()};
  }

  componentDidMount() {
    socket.on('all_states', (arr) => {
      this.setState((previousState) => {
        const newMap = new Map();
        for (const statusData of arr) {
          newMap.set(statusData.username, statusData.status);
        }
        return {statusMap: newMap};
      });
      console.log('New states:', this.state);
    },
    );

    socket.on('state', (statusData) => {
      this.setState((previousState) => {
        const newMap = previousState.statusMap;
        newMap.set(statusData.username, statusData.status);
        return {statusMap: newMap};
      });
      console.log('New states:', this.state);
    },
    );
  }

  render() {
    const rowArray = [];
    this.state.statusMap.forEach( (status, username) => {
      if (username === myName) {
        return;
      }
      rowArray.push({status: status, username: username});
    });

    if (rowArray.length === 0) {
      return (
        <div>
            Waiting for data
        </div>
      );
    } else {
      return (
        <div>
          <table className="table table-hover table-sm">
            <thead><tr>
              <th className="w-50">Name</th>
              <th className="w-50">Status</th>
            </tr></thead>
            <tbody>
              {
                rowArray.map((statusData) =>
                  <StatusTableRow key={statusData.username} statusData={statusData} />,
                )
              }
            </tbody>
          </table>
        </div>
      );
    }
  }
};

class StatusTableRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const color = color_.get(this.props.statusData.status) || 'LightBlue';
    return (
      <tr>
        <td> {this.props.statusData.username} </td>
        <td style={{backgroundColor: color}}>
          {this.props.statusData.status}
        </td>
      </tr>
    );
  }
}

class StatusControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {myStatus: 'unknown'};

    this.handleChange = this.handleChange.bind(this);

    socket.on('state', (statusData) => {
      if (statusData.username === myName) {
        this.setState({myStatus: statusData.status});
      }
    });
  }

  handleChange(event) {
    myStatusIndex = (myStatusIndex + 1) % status_.length;
    socket.emit('set_status', {new_status: status_[myStatusIndex], token: token});
  }

  render() {
    return (<div>
      <table className="table table-hover table-sm">
        <thead><tr>
          <th className="w-50">Name</th>
          <th className="w-50">Status</th>
        </tr></thead>
        <tbody>
          <StatusTableRow statusData={{username: myName, status: this.state.myStatus}} />
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={this.handleChange}>
          Change status
      </button>
    </div>);
  }
}

class Timers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {secondsToday: 0, secondsWeek: 0};
  }

  componentDidMount() {
    this.interval = setInterval( () => {
      if (myStatusIndex != 1) return;
      this.setState((previousState) => {
        return {
          secondsToday: previousState.secondsToday + 1,
          secondsWeek: previousState.secondsWeek + 1,
        };
      });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (<div>
      <table className="table table-hover table-sm">
        <tbody>
          <tr>
            <td className="w-50">Work today</td>
            <td>{timestr(this.state.secondsToday)}</td>
          </tr>
          <tr>
            <td className="w-50">Work this week</td>
            <td>{timestr(this.state.secondsWeek)}</td>
          </tr>
        </tbody>
      </table>
    </div>);
  }
}

ReactDOM.render(
    <App />,
    document.getElementById('reactDOM'),
);
