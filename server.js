const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const users = new Map();
const userSockets = new Map();
const activeCalls = new Map();
const waitingCalls = new Map();

app.post('/api/register', (req, res) => {
  const { username, userId } = req.body;
  if (!username || !userId) {
    return res.status(400).json({ error: 'Username and userId required' });
  }
  res.json({ success: true, message: 'Registered successfully' });
});

app.get('/api/users', (req, res) => {
  const userList = Array.from(userSockets.entries()).map(([id, socketId]) => ({
    userId: id,
    username: users.get(socketId)?.username || 'Unknown',
    online: true
  }));
  res.json(userList);
});

app.get('/api/call-status/:userId', (req, res) => {
  const userId = req.params.userId;
  const inCall = activeCalls.has(userId);
  res.json({ inCall });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('register', (data) => {
    const { username, userId } = data;
    
    if (userSockets.has(userId)) {
      const oldSocketId = userSockets.get(userId);
      users.delete(oldSocketId);
    }
    
    users.set(socket.id, { username, userId });
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    socket.username = username;
    
    broadcastUserList();
    console.log(`User registered: ${username} (${userId})`);
  });
  
  socket.on('call-user', (data) => {
    const { targetId, callType } = data;
    const targetSocketId = userSockets.get(targetId);
    
    if (!targetSocketId) {
      socket.emit('call-error', { message: 'User is offline' });
      return;
    }
    
    if (activeCalls.has(targetId)) {
      socket.emit('call-error', { message: 'User is busy' });
      return;
    }
    
    waitingCalls.set(socket.userId, { 
      targetId, 
      callType,
      timestamp: Date.now()
    });
    
    io.to(targetSocketId).emit('incoming-call', {
      from: socket.userId,
      fromName: socket.username,
      callType: callType
    });
    
    console.log(`Call initiated: ${socket.username} -> ${targetId} (${callType})`);
  });
  
  socket.on('accept-call', (data) => {
    const { fromId } = data;
    const callerSocketId = userSockets.get(fromId);
    
    if (!callerSocketId) {
      socket.emit('call-error', { message: 'Caller disconnected' });
      return;
    }
    
    activeCalls.set(socket.userId, fromId);
    activeCalls.set(fromId, socket.userId);
    waitingCalls.delete(fromId);
    
    io.to(callerSocketId).emit('call-accepted', {
      targetId: socket.userId,
      targetName: socket.username
    });
    
    console.log(`Call accepted: ${socket.username} <-> ${fromId}`);
  });
  
  socket.on('reject-call', (data) => {
    const { fromId } = data;
    const callerSocketId = userSockets.get(fromId);
    
    waitingCalls.delete(fromId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-rejected', {
        message: `${socket.username} rejected the call`
      });
    }
    
    console.log(`Call rejected: ${socket.username} declined ${fromId}`);
  });
  
  socket.on('offer', (data) => {
    const { targetId, offer } = data;
    const targetSocketId = userSockets.get(targetId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('offer', {
        from: socket.userId,
        offer: offer
      });
    }
  });
  
  socket.on('answer', (data) => {
    const { targetId, answer } = data;
    const targetSocketId = userSockets.get(targetId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('answer', {
        from: socket.userId,
        answer: answer
      });
    }
  });
  
  socket.on('ice-candidate', (data) => {
    const { targetId, candidate } = data;
    const targetSocketId = userSockets.get(targetId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', {
        from: socket.userId,
        candidate: candidate
      });
    }
  });
  
  socket.on('end-call', (data) => {
    handleCallEnd(socket, data?.targetId);
  });
  
  socket.on('cancel-call', (data) => {
    const { targetId } = data;
    const targetSocketId = userSockets.get(targetId);
    
    waitingCalls.delete(socket.userId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-cancelled', {
        from: socket.userId
      });
    }
    
    console.log(`Call cancelled: ${socket.username} -> ${targetId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.userId) {
      const partnerId = activeCalls.get(socket.userId);
      if (partnerId) {
        const partnerSocketId = userSockets.get(partnerId);
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('call-ended', {
            from: socket.userId,
            reason: 'disconnected'
          });
        }
        activeCalls.delete(partnerId);
      }
      
      activeCalls.delete(socket.userId);
      waitingCalls.delete(socket.userId);
      userSockets.delete(socket.userId);
      users.delete(socket.id);
      
      broadcastUserList();
    }
  });
});

function handleCallEnd(socket, targetId) {
  if (!targetId && socket.userId) {
    targetId = activeCalls.get(socket.userId);
  }
  
  if (targetId) {
    const targetSocketId = userSockets.get(targetId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended', {
        from: socket.userId,
        reason: 'ended'
      });
    }
    
    activeCalls.delete(socket.userId);
    activeCalls.delete(targetId);
    
    console.log(`Call ended: ${socket.username} <-> ${targetId}`);
  }
}

function broadcastUserList() {
  const userList = Array.from(userSockets.entries()).map(([userId, socketId]) => {
    const inCall = activeCalls.has(userId);
    return {
      userId: userId,
      username: users.get(socketId)?.username || 'Unknown',
      online: true,
      inCall: inCall
    };
  });
  io.emit('user-list', userList);
}

setInterval(() => {
  const now = Date.now();
  for (const [callerId, callData] of waitingCalls.entries()) {
    if (now - callData.timestamp > 60000) {
      const callerSocketId = userSockets.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-timeout', {
          message: 'Call timeout'
        });
      }
      waitingCalls.delete(callerId);
    }
  }
}, 10000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
