<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>TelegramCall - Бесплатные видеозвонки</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            overflow: hidden;
        }

        /* Регистрация */
        .auth-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .auth-card {
            background: rgba(30, 30, 46, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 28px;
            padding: 40px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-card h1 {
            margin-bottom: 10px;
            background: linear-gradient(135deg, #2ea6ff, #0088cc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .auth-input {
            width: 100%;
            padding: 14px;
            margin: 12px 0;
            background: #1a1a2e;
            border: 1px solid #2ea6ff;
            border-radius: 12px;
            color: white;
            font-size: 16px;
        }

        .auth-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #2ea6ff, #0088cc);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
        }

        /* Основной интерфейс */
        .app-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        .telegram-header {
            background: #1a1a2e;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #2ea6ff;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 600;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #2ea6ff, #0088cc);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #2ea6ff, #0088cc);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 18px;
        }

        .main-grid {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .contacts-sidebar {
            width: 320px;
            background: #0f0f1a;
            border-right: 1px solid #2ea6ff;
            display: flex;
            flex-direction: column;
        }

        .contacts-header {
            padding: 16px;
            border-bottom: 1px solid #2ea6ff;
            font-weight: 600;
        }

        .contacts-list {
            flex: 1;
            overflow-y: auto;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .contact-item:hover {
            background: #1a1a2e;
        }

        .contact-avatar {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #2ea6ff, #0088cc);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
        }

        .contact-info {
            flex: 1;
        }

        .contact-name {
            font-weight: 600;
        }

        .call-buttons {
            display: flex;
            gap: 8px;
        }

        .call-icon {
            background: #2ea6ff;
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
        }

        .call-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #0a0a0a;
        }

        .call-header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #2ea6ff;
        }

        .video-container {
            flex: 1;
            position: relative;
            background: #000;
        }

        .remote-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .local-video {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            border: 2px solid #2ea6ff;
            cursor: pointer;
            z-index: 10;
        }

        .call-controls {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 20px;
            background: #1a1a2e;
        }

        .control-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 24px;
            transition: transform 0.2s;
        }

        .control-btn.end-call {
            background: #dc2626;
            color: white;
        }

        .incoming-call {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #1a1a2e;
            border: 2px solid #2ea6ff;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            gap: 15px;
            z-index: 200;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .hidden {
            display: none;
        }

        .call-status-text {
            text-align: center;
            padding: 40px;
            color: #8b949e;
        }
    </style>
</head>
<body>
<div id="authContainer" class="auth-container">
    <div class="auth-card">
        <div class="logo-icon" style="margin: 0 auto 20px; width: 60px; height: 60px; font-size: 30px;">📞</div>
        <h1>TelegramCall</h1>
        <p style="color: #8b949e; margin-bottom: 30px;">Бесплатные видеозвонки</p>
        <input type="text" id="regUsername" class="auth-input" placeholder="Ваше имя">
        <input type="text" id="regUserId" class="auth-input" placeholder="Ваш ID (например: mama)">
        <button class="auth-btn" id="registerBtn">Зарегистрироваться</button>
        <p style="font-size: 12px; color: #8b949e; margin-top: 20px;">Скажите свой ID маме, чтобы она могла вам позвонить!</p>
    </div>
</div>

<div id="appContainer" class="app-container hidden">
    <div class="telegram-header">
        <div class="logo">
            <div class="logo-icon">📞</div>
            <span>TelegramCall</span>
        </div>
        <div class="user-info">
            <span id="currentUserName"></span>
            <div class="avatar" id="userAvatar"></div>
            <button id="logoutBtn" style="background: transparent; border: 1px solid #2ea6ff; color: #2ea6ff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 15px;">Выйти</button>
        </div>
    </div>

    <div class="main-grid">
        <div class="contacts-sidebar">
            <div class="contacts-header">Контакты онлайн</div>
            <div class="contacts-list" id="contactsList"></div>
        </div>

        <div class="call-area" id="callArea">
            <div class="call-header">
                <h2 id="callWithName">Готов к звонкам</h2>
            </div>
            <div id="callContent">
                <div class="call-status-text">
                    📞 Выберите контакт и нажмите на звонок<br>
                    <small style="color: #8b949e;">Бесплатные P2P видеозвонки</small>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
    let socket = null;
    let currentUser = null;
    let peerConnection = null;
    let localStream = null;
    let currentCall = null;
    let pendingCall = null;

    // DOM элементы
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const registerBtn = document.getElementById('registerBtn');
    const contactsList = document.getElementById('contactsList');

    // Проверка сохранённого пользователя при загрузке
    window.addEventListener('DOMContentLoaded', () => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                if (currentUser.username && currentUser.userId) {
                    // Автоматический вход
                    authContainer.classList.add('hidden');
                    appContainer.classList.remove('hidden');
                    document.getElementById('currentUserName').textContent = currentUser.username;
                    document.getElementById('userAvatar').textContent = currentUser.username[0].toUpperCase();
                    
                    // Подключение к WebSocket
                    socket = io();
                    socket.on('connect', () => {
                        socket.emit('register', { username: currentUser.username, userId: currentUser.userId });
                    });
                    setupSocketListeners();
                }
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }
    });

    // Регистрация по Enter
    document.getElementById('regUsername').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerBtn.click();
    });
    
    document.getElementById('regUserId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerBtn.click();
    });

    // Регистрация
    let isRegistering = false;
    
    registerBtn.addEventListener('click', async () => {
        // Защита от двойного клика
        if (isRegistering) return;
        
        const username = document.getElementById('regUsername').value.trim();
        const userId = document.getElementById('regUserId').value.trim();
        
        // Валидация полей
        if (!username || !userId) {
            alert('Заполните все поля');
            return;
        }
        
        if (username.length < 2) {
            alert('Имя должно содержать минимум 2 символа');
            return;
        }
        
        if (username.length > 30) {
            alert('Имя не должно превышать 30 символов');
            return;
        }
        
        if (userId.length < 2) {
            alert('ID должен содержать минимум 2 символа');
            return;
        }
        
        if (userId.length > 20) {
            alert('ID не должен превышать 20 символов');
            return;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
            alert('ID может содержать только латинские буквы, цифры и подчёркивание');
            return;
        }
        
        // Блокируем кнопку и показываем индикатор
        isRegistering = true;
        registerBtn.disabled = true;
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Регистрация...';
        registerBtn.style.opacity = '0.6';
        
        try {
            currentUser = { username, userId };
            
            // Регистрация на сервере
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, userId })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка регистрации');
            }
            
            // Сохраняем пользователя
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Подключение к WebSocket
            socket = io();
            
            socket.on('connect', () => {
                socket.emit('register', { username, userId });
            });
            
            socket.on('connect_error', () => {
                alert('Ошибка подключения к серверу. Проверьте соединение.');
                isRegistering = false;
                registerBtn.disabled = false;
                registerBtn.textContent = originalText;
                registerBtn.style.opacity = '1';
            });
            
            setupSocketListeners();
            
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            document.getElementById('currentUserName').textContent = username;
            document.getElementById('userAvatar').textContent = username[0].toUpperCase();
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert(error.message || 'Ошибка при регистрации. Попробуйте другой ID.');
            isRegistering = false;
            registerBtn.disabled = false;
            registerBtn.textContent = originalText;
            registerBtn.style.opacity = '1';
        }
    });

    // Обработчик выхода
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            // Отключаем сокет
            if (socket) {
                socket.disconnect();
                socket = null;
            }
            
            // Останавливаем звонок если активен
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            
            // Очищаем данные
            localStorage.removeItem('currentUser');
            currentUser = null;
            currentCall = null;
            pendingCall = null;
            
            // Очищаем поля ввода
            document.getElementById('regUsername').value = '';
            document.getElementById('regUserId').value = '';
            
            // Показываем форму регистрации
            appContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
        }
    });

    function setupSocketListeners() {
        socket.on('user-list', (users) => {
            renderContacts(users.filter(u => u.userId !== currentUser.userId));
        });
        
        socket.on('incoming-call', (data) => {
            showIncomingCall(data);
        });
        
        socket.on('call-accepted', async (data) => {
            document.getElementById('callStatusText').innerHTML = 'Соединение устанавливается...';
            await startCall(data.targetId, currentCall?.callType);
        });
        
        socket.on('call-rejected', () => {
            endCall();
            showNotification('Звонок отклонён');
        });
        
        socket.on('call-ended', () => {
            endCall();
            showNotification('Звонок завершён');
        });
        
        socket.on('offer', async (data) => {
            await handleOffer(data);
        });
        
        socket.on('answer', async (data) => {
            await handleAnswer(data);
        });
        
        socket.on('ice-candidate', async (data) => {
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });
    }

    async function makeCall(targetId, callType) {
        currentCall = { targetId, callType };
        
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true
            });
            
            peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        targetId: targetId,
                        candidate: event.candidate
                    });
                }
            };
            
            peerConnection.ontrack = (event) => {
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo && event.streams[0]) {
                    remoteVideo.srcObject = event.streams[0];
                }
            };
            
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            socket.emit('offer', {
                targetId: targetId,
                offer: offer
            });
            
            showCallUI(callType);
            socket.emit('call-user', { targetId, callType });
            
        } catch (error) {
            console.error('Error starting call:', error);
            alert('Не удалось начать звонок. Проверьте микрофон и камеру.');
        }
    }

    async function handleOffer(data) {
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStream);
                });
            }
            
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        targetId: data.from,
                        candidate: ev
