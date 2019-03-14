require("dotenv").config()
const express = require('express')
const app = express();
const path = require('path')
const server = require('http').createServer(app);
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');
const io = require('socket.io')(server);
const crypto = require("crypto");

// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/db")
app.use(express.static(path.join(__dirname, "client", "build")))

// contains arrays of the usernames of people in a lobby, indexed by lobby id
let games = {};

app.get('/api/create-room/', (req, res) => {
    let roomId = crypto.randomBytes(5).toString('hex');
    games[roomId] = [];
    let lobby = io.of(roomId);
    lobby.on('connection', (socket) => {
        if (games[roomId].length >= 8) {
            // room is full
            socket.emit('room full');
            socket.disconnect()
        }
    
        socket.on('join', (username) => {
            socket.username = username;
            socket.emit('player list', games[roomId]);
            games[roomId].push(username);
            socket.broadcast.emit('player joined', username);
        });

        socket.on('start game', () => {
            // TODO: actually start game
            lobby.emit('start game', {});
        });

        socket.on('disconnect', () => {
            if (games[roomId]) {
                games[roomId] = games[roomId].filter((username) => {
                    username != socket.username;
                });
                if (games[roomId].length == 0) {
                    // lobby is empty so remove it
                    delete games[roomId];
                    // removes the namespace https://stackoverflow.com/questions/26400595/socket-io-how-do-i-remove-a-namespace
                    const connectedSockets = Object.keys(lobby.connected); // Get Object with Connected SocketIds as properties
                    connectedSockets.forEach(socketId => {
                        lobby.connected[socketId].disconnect(); // Disconnect Each socket
                    });
                    lobby.removeAllListeners();
                    delete io.nsps[lobby];
                }
            }
        });
    });
    res.send(roomId);
});

// returns whether a game with that
app.get('/api/game/:id', (req, res) => {
    res.send(!!games[req.params.id]);
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))