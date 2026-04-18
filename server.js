// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- НОВОЕ: Middleware для обработки JSON-запросов ---
app.use(express.json());
app.use(cors());

// --- НОВОЕ: Хранилище пользователей (если ещё нет) ---
const users = new Map(); // userId -> { username, socketId, inCall }

// --- НОВОЕ: API регистрации ---
app.post('/api/register', (req, res) => {
  const { username, userId } = req.body;

  // Валидация (как на клиенте)
  if (!username || !userId) {
    return res.status(400).json({ message: 'Имя и ID обязательны' });
  }
  if (username.length < 2 || userId.length < 2) {
    return res.status(400).json({ message: 'Имя и ID должны быть не менее 2 символов' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
    return res.status(400).json({ message: 'ID может содержать только латинские буквы, цифры и подчёркивание' });
  }

  // Проверка, не занят ли ID уже онлайн-пользователем
  if (users.has(userId)) {
    return res.status(409).json({ message: 'Этот ID уже используется' });
  }

  // Всё хорошо — разрешаем регистрацию
  res.status(200).json({ success: true });
});

// Раздача статических файлов (index.html и др.) — если нужно
app.use(express.static('public')); // или корень проекта

// --- ДАЛЕЕ ИДЁТ ВАША СУЩЕСТВУЮЩАЯ ЛОГИКА SOCKET.IO, НИЧЕГО НЕ УДАЛЯЕМ ---

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Регистрация пользователя через WebSocket
  socket.on('register', ({ username, userId }) => {
    // Сохраняем пользователя
    users.set(userId, {
      username,
      socketId: socket.id,
      inCall: false
    });
    socket.userId = userId;
    socket.username = username;

    // Отправляем обновлённый список всем
    io.emit('user-list', Array.from(users.entries()).map(([id, data]) => ({
      userId: id,
      username: data.username,
      inCall: data.inCall
    })));

    console.log(`Пользователь зарегистрирован: ${username} (${userId})`);
  });

  // Обработчики звонков (оставляем как есть, только убедимся, что они используют users Map)
  socket.on('call-user', ({ targetId, callType }) => {
    const target = users.get(targetId);
    if (target && !target.inCall) {
      io.to(target.socketId).emit('incoming-call', {
        from: socket.userId,
        fromName: socket.username,
        callType
      });
      // Помечаем, что инициатор в звонке
      const caller = users.get(socket.userId);
      if (caller) caller.inCall = true;
    } else {
      socket.emit('call-error', { message: 'Пользователь недоступен или уже в звонке' });
    }
  });

  socket.on('accept-call', ({ fromId }) => {
    const fromUser = users.get(fromId);
    const currentUser = users.get(socket.userId);
    if (fromUser && currentUser) {
      fromUser.inCall = true;
      currentUser.inCall = true;
      io.to(fromUser.socketId).emit('call-accepted', {
        targetId: socket.userId,
        targetName: socket.username
      });
    }
  });

  socket.on('reject-call', ({ fromId }) => {
    const fromUser = users.get(fromId);
    if (fromUser) {
      io.to(fromUser.socketId).emit('call-rejected');
    }
  });

  socket.on('end-call', ({ targetId }) => {
    const target = users.get(targetId);
    if (target) {
      io.to(target.socketId).emit('call-ended');
      target.inCall = false;
    }
    const caller = users.get(socket.userId);
    if (caller) caller.inCall = false;
  });

  socket.on('offer', ({ targetId, offer }) => {
    const target = users.get(targetId);
    if (target) {
      io.to(target.socketId).emit('offer', {
        from: socket.userId,
        offer
      });
    }
  });

  socket.on('answer', ({ targetId, answer }) => {
    const target = users.get(targetId);
    if (target) {
      io.to(target.socketId).emit('answer', {
        from: socket.userId,
        answer
      });
    }
  });

  socket.on('ice-candidate', ({ targetId, candidate }) => {
    const target = users.get(targetId);
    if (target) {
      io.to(target.socketId).emit('ice-candidate', {
        from: socket.userId,
        candidate
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      users.delete(socket.userId);
      io.emit('user-list', Array.from(users.entries()).map(([id, data]) => ({
        userId: id,
        username: data.username,
        inCall: data.inCall
      })));
    }
    console.log('Клиент отключился:', socket.id);
  });
});

// --- ЗАПУСК СЕРВЕРА (порт как был) ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
