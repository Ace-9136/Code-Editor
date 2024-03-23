// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    socketId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
