
const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));

const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);

const io = new Server(server);

io.on('connection', socket => {
  socket.on('signal', data => {
    socket.broadcast.emit('signal', data);
  });
});

server.listen(3000, () => console.log('https://localhost:3000'));
