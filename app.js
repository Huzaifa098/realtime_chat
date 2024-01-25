const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(` server on port ${PORT}`));
const mysql = require('mysql');
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'realtime_chat',
});

let socketsConnected = new Set();

io.on('connection', onConnected);

function onConnected(socket) {
  console.log('Socket connected', socket.id);
  socketsConnected.add(socket.id);
  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', (data) => {
    const insertQuery = 'INSERT INTO messages (name, message) VALUES (?, ?)';
       const values = [data.name, data.message];

       db.query(insertQuery, values, (err) => {
         if (err) {
           console.error('Error inserting message into database:', err);
           return;
         }
  })
    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);
  });
}







