const express = require('express');
const app = express();
const path = require('path');

const socketIO = require('socket.io');

const { sequelize, User } = require('./db');

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
    await User.create( { name: 'test user' } );
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


const io = socketIO(server);

io.on( 'connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(
    () => io.emit('time', new Date().toTimeString()),
    1000,
);
