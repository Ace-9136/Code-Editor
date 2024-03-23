const express = require('express');
const http = require("http");
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('./Model/user'); // Assuming you have a User model
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const ACTIONS = require(`./Actions`);
const path = require('path');

app.use(express.static('../Front-End/dist'));

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname, '../Front-End/dist', 'index.html'));
});

function getAllConnectedClients(roomId) {
    return User.find({ roomId }); // Assuming you have a 'roomId' field in your user schema
}

io.on('connection', (socket) => {

    socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
        socket.join(roomId);
        await User.create({ socketId: socket.id, username, roomId });
        const clients = await getAllConnectedClients(roomId);
        io.to(roomId).emit(ACTIONS.JOINED, { clients, username, socketId: socket.id });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, async ({ socketId, code }) => {
        // Assuming you have a method to find user by socketId
        const user = await User.findOne({ socketId });
        if (user) {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        }
    });

    socket.on('disconnecting', async () => {
        const user = await User.findOne({ socketId: socket.id });
        if (user) {
            socket.leave(user.roomId);
            io.to(user.roomId).emit(ACTIONS.DISCONNECTED, { socketId: socket.id, username: user.username });
            await User.deleteOne({ socketId: socket.id });
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MongoURL, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});
