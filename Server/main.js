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
const { createClient } = require('redis');
const Redis = require("ioredis");

async function connectToRedis() {
    const redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      });
    console.log("Connect to redisClient");
    return redisClient;
}
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MongoURL, {
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

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
        const redisClient = global.redisClient;
        const chatMessagesKey = `chat_messages_${roomId}`;

    // Check if the key exists
    const keyExists = await redisClient.exists(chatMessagesKey);

    if (keyExists) {
        // Key exists, retrieve chat messages
        const existingMessages = await redisClient.lrange(chatMessagesKey, 0, -1);
        const parsedMessages = existingMessages.reverse().map((item) => JSON.parse(item));
        io.to(roomId).emit("historical_messages", parsedMessages);
    } else {
        // Key doesn't exist, handle accordingly (e.g., send empty array)
        io.to(roomId).emit("historical_messages", []);
    }
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

    socket.on("message", (data) => {
        io.to(data.roomId).emit("message", data);
        const redisClient = global.redisClient; 
        redisClient.lpush(`chat_messages_${data.roomId}`, JSON.stringify(data));
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
async function startServer() {
    const redisClient = await connectToRedis();
    global.redisClient = redisClient; // Make redisClient globally accessible
    await connectToMongoDB();
    server.listen(PORT, () => {
        console.log(`Server started on ${PORT}`);
    });
}

startServer();

