const express = require('express');
const app = express();
const path = require('path');

const socketIO = require('socket.io');

const db = require('./db');

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/db', async (request, response) => {
  try {
    db.query('SELECT * FROM test_table', [], (err, result) => {
      if (err) {
        return next(err);
      }
      const results = {'results': (result) ? result.rows : null};
      console.log(results);
      response.json(results);
    });
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
