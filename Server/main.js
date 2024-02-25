
const express = require('express');
const http = require("http");
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const ACTIONS = require(`./Actions`);
const path = require('path');
const userSocketMap ={};

app.use(express.static('../Front-End/dist'));

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname, '../Front-End/dist', 'index.html'));
})
function getAllConnectedClients(roomId) {
    // Map
    
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT= process.env.PORT || 5000;
server.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});
