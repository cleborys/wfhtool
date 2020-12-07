const express = require('express');
const app = express();
const path = require('path');

const socketIO = require('socket.io');

const { Pool } = require('pg'); // postgres database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    sslmode: 'disable',
    rejectUnauthorized: false,
  },
});
console.log(`Database connection: ${process.env.DATABASE_URL}`);


app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/db', async (request, response) => {
  try {
    const client = await pool.connect(); 
    const result = await client.query('SELECT * from test_table');
    const results = { 'results': (result) ? result.rows : null };
    console.log(results);
    response.json(results);
    client.release();
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
