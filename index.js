const express = require('express');
const app = express();
const path = require('path');

const socketio = require('socket.io');

const {sequelize, User} = require('./db');
const {loginSocket} = require('./server/auth.js');
const {setStatus} = require('./server/status.js');

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/db', async (request, response) => {
  try {
    try {
      await sequelize.authenticate();
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Unable to connect to database:', error);
    }
    await sequelize.sync();
    console.log('Successfully synced');
    await User.create( {name: 'Alice'} );
    console.log('User created');
    const users = await User.findAll();
    console.log('Users found');
    console.log(users);
    response.json(users);
  } catch (err) {
    console.log(err);
    response.send('Error ' + err);
  }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log('Hello, world!');
  console.log(`Listening on port ${port}`);
});


const io = socketio(server);
io.on('connection', (socket) => {
  console.log('A socket connected');

  socket.on('login', async (data) => {
    const response = await loginSocket(data);
    console.log('Login request response is ', response);
    socket.emit('login_result', response);
  });

  socket.on('set_status', (data) => {
    setStatus(data);
  });

  socket.on('disconnect', () => console.log('A socket disconnected'));
});
