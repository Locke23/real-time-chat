const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeaveChat, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ChatCord Bot';

// run when client connects
io.on('connection', socket => {

    socket.on('join-room', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)
            // emit only to the client
        socket.emit('chat-message', formatMessage(botName, 'Welcome to chatcord'));

        // Broadcast when user connects (all the other clients)
        socket.broadcast.to(user.room).emit('chat-message', formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    // listen for chat message
    socket.on('chat-message', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('chat-message', formatMessage(user.username, msg))
    });

    // runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeaveChat(socket.id);

        if (user) {
            // all the clients
            io.to(user.room).emit('chat-message', formatMessage(botName, `${user.username} has left the chat`));
            // Send users and room info
            io.to(user.room).emit('room-users', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
})

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`server listening on port: ${port}`));