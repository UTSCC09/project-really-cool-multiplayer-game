//https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274
//https://medium.com/@bogna.ka/integrating-google-oauth-with-express-application-f8a4a2cf3fee
//https://stackoverflow.com/questions/39183392/deploying-nodejs-mongoose-to-heroku
require("dotenv").config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require('path');
const passport = require('passport');
const googleAuth = require('./auth/googleAuth.js');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

//DB stuff
const userScheme = new mongoose.Schema({
  googleId: String,
  email: String,
  token: String,
  givenName: String,
  familyName: String
});

const instructionScheme = new mongoose.Schema({
  content: String
});

const deckScheme = new mongoose.Schema({
  ownerId: String,
  cards: String,
});

var User = mongoose.model('User', userScheme);
var Instruction = mongoose.model('Instruction', instructionScheme);
var Deck = mongoose.model('Deck', deckScheme);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/db", { useNewUrlParser: true });
let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const PORT = process.env.PORT || 5000;
const router = express.Router();
var isAuthenticated = function(req, res, next) {
  if (!req.session.token) return res.send(401, {error: "Access denied"});
  next();
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

googleAuth(passport);
app.use(passport.initialize());
app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));
app.use(cookieParser());

// SERVER ROUTES
// CREATE
app.post('/api/deck/', isAuthenticated, function(req, res) {
  let deckContent = req.body.content;
  let newDeck = new Deck({content: deckContent, ownerId: req.session.userId});
  newDeck.save(function(err, newDeck) {
    if (err) return res.send(500, {error: err});
  });
  return res.json(newDeck._id);
});

// READ
app.get('/', function (req, res) {
  if (req.session.token) {
    res.cookie('token', req.session.token);
    res.json({
      status: 'session cookie set'
    });
  } else {
    res.cookie('token', '');
    res.json({
      status: 'session cookie not set'
    });
  }
});

// Google authentication
app.get('/auth/google/', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/callback/', passport.authenticate('google', {failureRedirect: '/' }), function (req, res) {
  // Save current token in session
  req.session.token = req.user.token;
  // Add the user to the DB
  let update = {
    token: req.user.token,
    email: req.user.profile.email,
    googleId: req.user.profile.id,
    givenName: req.user.profile.name.givenName,
    familyName: req.user.profile.name.familyName
  }
  let option = {new: true, upsert: true, setDefaultOnInsert: true};

  User.findOneAndUpdate({googleId: googleId}, update, option).exec(function(err, user) {
    if (err) return res.send(500, { error: err });
  })
  res.redirect('/');
});

app.get('/logout/', function (req, res) {
    req.logout();
    let update = {token: ""}
    User.findOneAndUpdate({token: req.session.token}, update, function(err, user) {
      if (err) return res.send(500, { error: err });
    })
    req.session = null;
    res.redirect('/');
});

app.get('/api/deck/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  Deck.findById(id, function(err, deck) {
    if (err) return res.send(500, {error : err});
    else if (user === null) return res.send(404, {error: 'Deck not found'});
    else return res.json(deck);
  });
});

app.get('/api/user/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  User.findById(id, function(err, user) {
    if (err) return res.send(500, {error : err});
    else if (user === null) return res.send(404, {error: 'User not found'});
    else return res.json(user);
  });
});

app.get('/api/user/token/:token/', function(req, res) {
  let token = req.params.token;
  User.findOne({token: token}, function(err, user) {
    if (err) return res.send(500, {error : err});
    else if (user === null) return res.send(404, {error: 'User not found'});
    else return res.json(user);
  });
});

// UPDATE
app.put('/api/deck/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  let content = req.body.content;
  let update = {content: content}
  Deck.findByIdAndUpdate(id, update, function(err, deck) {
    if (err) return res.send(500, { error: err });
    else if (deck === null) return res.send(404, {error: "Deck does not exist"});
    else return res.json(deck);
  });
});

// DELETE
app.delete('/api/deck/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  Deck.findByIdAndDelete(id, function(err, deck) {
    if (err) return res.send(500, { error: err });
    else if (deck === null) return res.send(404, {error: "Deck does not exist"});
    else return res.json(deck);
  });
});

app.delete('/api/user/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  User.findByIdAndDelete(id, function(err, user) {
    if (err) return res.send(500, { error: err });
    else if (user === null) return res.send(404, {error: "User does not exist"});
    else return res.json(user);
  });
});

app.use(express.static(path.join(__dirname, "client", "build")));

// contains arrays of the usernames of people in a lobby, indexed by lobby id
let games = {};

app.get('/api/create-room/', (req, res) => {
    let roomId = crypto.randomBytes(5).toString('hex');
    games[roomId] = { public: {}, players: [] };

    let lobby = io.of(roomId);
    lobby.on('connection', (socket) => {
        if (games[roomId].players.length >= 8) {
            // room is full
            socket.emit('room full');
            socket.disconnect()
        }

        socket.on('join', (username) => {
            socket.username = username;
            socket.emit('player list', games[roomId].players);
            games[roomId].players.push({ username: username, socketId: socket.id });
            socket.broadcast.emit('player joined', username);

        });

        socket.on('start game', () => {
          // TODO: actually start game
          // lobby.emit('start game', {});

          // Decide what game to play/ what deck to use here
          // Default cards against humanity is default here
          // fetch (get deck from database here)

          // Host decided settings are set here for the game
          games[roomId].public = {
            blackCard: String,
            cardCsar: String,
            settings: {},
            players: [];  // names and scores for each player
          }
          let deck = Array.from(Array(200).keys()); // cause we havent made decks yet
          let initialCards = 7;

          // Deal cards to eahc player
          for (player in games[roomId].players) {
            player[cards] = [];
            for (let i = 0; i < initialCards; i++) {
              player[cards].push(deck.pop());
            }
            io.to(player.socketId).emit('start game', {public: games[roomId].public, private: player});
          }
        });

        socket.on('disconnect', () => {
            if (games[roomId].players) {
                games[roomId].players = games[roomId].players.filter((player) => {
                    player.username != socket.username;
                });
                if (games[roomId].players.length == 0) {
                    // lobby is empty so remove it
                    delete games[roomId].players;
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
