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
  ownerId: mongoose.Schema.Types.ObjectId,
  cards: [String],
});

const gameScheme = new mongoose.Schema({
  name: String,
  decks: {type: Map, of: deckScheme}
});

var User = mongoose.model('User', userScheme);
var Instruction = mongoose.model('Instruction', instructionScheme);
var Deck = mongoose.model('Deck', deckScheme);
var Game = mongoose.model('Game', gameScheme);


mongoose.connect(process.env.MONGODB_URI || "mongodb://test:test123@ds213896.mlab.com:13896/heroku_nz567lg6", { useNewUrlParser: true });
let db = mongoose.connection;

console.log("DB running on: " + process.env.MONGODB_URI || "mongodb://test:test123@ds213896.mlab.com:13896/heroku_nz567lg6");

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
    keys: ['123'],
    maxAge: 7 * 24 * 60 * 60 * 1000 // cookies will last 1 week
}));
app.use(cookieParser());
app.use(function(req, res, next) {
  // console.log("REQUEST: ", req. /);
  next();
});

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

var multer  = require('multer')
var upload = multer();

app.post('/api/file/', upload.single('file'), function(req, res) {
  // console.log("asdfasdfasd", req.file);
  let buffer = req.file.buffer;
  let cardContent = buffer.toString('utf8').split('\n');
  // Set This in the card database;
  // // Make a thing and put it in the database
  // let d1 = new Deck({ownerId: "5c8a02a89f0f3cbb9a5b75f6", cards: cardContent}); // 5c8dc7c0b6aa482b6f8ac885
  // let d2 = new Deck({ownerId: "5c8a02a89f0f3cbb9a5b75f6", cards: cardContent}); // 5c8dc89d47e8042ba5673c20
  // d2.save(function(err, d) {
  //   if (err) console.log("d2 didnt save help");
  //   Deck.findById('5c8dc7c0b6aa482b6f8ac885', function(err, black) {
  //     if (!black) {
  //
  //
  //
  //
  //     } else {
  //       console.log("HELP");
  //     }
  //   });
  // });



  // console.log(req.file.buffer);
  res.json(cardContent);
});

// READ
app.get('/', function (req, res, next) {
  if (req.session.token) {
    res.cookie('token', req.session.token);
  } else {
    res.cookie('token', '');
  }
  next();
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
    email: req.user.profile.emails[0].value,
    googleId: req.user.profile.id,
    givenName: req.user.profile.name.givenName,
    familyName: req.user.profile.name.familyName
  }
  let option = {new: true, upsert: true, setDefaultOnInsert: true};
  User.findOneAndUpdate({googleId: req.user.profile.id}, update, option).exec(function(err, user) {
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

app.get('/api/games/list/', function(req, res) {
  Game.find({}, function(err, games) {
    if (err) return res.send(500, {error: err});
    else if (games.length === 0) return res.send(404, {error: 'No games found'});
    else return res.json(games);
  });
});

app.get('/api/games/:id/', function(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id)) return res.send(400, {error: "Invalid id"});
  Game.findById(id, function(err, game) {
    if (err) return res.send(500, {error: err});
    else if (game === null) return res.send(404, {error: 'Game not found'});
    else return res.json(game);
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

// // Make a thing and put it in the database
// let d1 = new Deck({ownerId: "5c8a02a89f0f3cbb9a5b75f6", cards: ["test1-1", "test1-2", "test1-3"]});
// let d2 = new Deck({ownerId: "5c8a02a89f0f3cbb9a5b75f6", cards: ["test2-1", "test2-2", "test2-3"]});
// let g = new Game({name: "THEGAME", decks: {"deck1": d1, "deck2": d2}});
// d1.save(function(err, d) {
//   if (err) console.log("d1 didnt save help");
// });
// d2.save(function(err, d) {
//   if (err) console.log("d2 didnt save help");
// });
// g.save(function(err, d) {
//   if (err) console.log("g didnt save help");
// });

// Deck.findById('5c8dc7c0b6aa482b6f8ac885', function(err, bd) {
//   if (!err && bd) {
//     Deck.findById('5c8dc89d47e8042ba5673c20', function(err, wd) {
//       if (!err && wd) {
//         let g = new Game({name: "CAH", decks: {whiteDeck: wd, blackDeck: bd}});
//         g.save(function(err, docs) {
//           if (err) console.log("g save error");
//         });
//       } else console.log("wd error");
//     });
//   } else console.log("bd error");
// });






// contains arrays of the usernames of people in a lobby, indexed by lobby id
let games = {};

app.get('/api/create-room/', (req, res) => {
    let roomId = crypto.randomBytes(5).toString('hex');
    console.log(`new room ${roomId}`)
    let currentGame = { public: {}, players: [] };

    function updateClientState(eventName) {
      for (let player of currentGame.players) {
        lobby.to(player.socketId).emit(eventName, {public: currentGame.public, private: player});
      }
    }

    let lobby = io.of(roomId);
    lobby.on('connection', (socket) => {
      console.log("person connected")

      if (currentGame.players.length >= 8) {
        // room is full
        socket.emit('room full');
        socket.disconnect()
      }

      socket.on('join', (username, callback) => {
        console.log(`${username} joined ${roomId}`)
        // TODO:  change function if they're joining mid-game
        console.log(`${username}: ${socket.id}`)
        currentGame.players.push({username, socketId: socket.id});
        if (callback) {
          callback(socket.id);
        }
        lobby.emit('player list', currentGame.players);
      });

      socket.once('start game', startGame);
      async function startGame(settings) {
        for (let socketId in lobby.connected) {
          lobby.connected[socketId].removeAllListeners('disconnect');
        }
        console.log(`start game: ${roomId}`);

        // Decide what game to play/ what deck to use here
        // Default cards against humanity is default here
        // fetch (get deck from database here)

        // Host decided settings are set here for the game

        // Settings will have game in it
        let gameId = "5c8dcad255c6482c14aa7326"; // settings.gameId
        let game = await Game.findById(gameId);

        currentGame.public = {
          blackCard: "",
          cardCsar: '',
          settings: {winningScore: 5},
          players: [],  // {username, score}
          whiteCards: [],
          winner: '',
        }


        // server only
        currentGame.private = {
          whiteCards: [], // {owner: socketId of the owner, content: string of its contents}
          cardCsarIdx: currentGame.players.length - 1
        }
        // TODO implement the deck
        // TODO, pull deck from database and do thing
        // let deck = Array.from(Array(200).keys()); // cause we havent made decks yet
        // let whiteDeck = Array.from(Array(200).keys());
        // let blackDeck = Array.from(Array(200).keys());
        let whiteDeck = game.decks.get('whiteDeck').cards;
        let blackDeck = game.decks.get('blackDeck').cards;

        // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        function shuffle(a) {
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        }

        shuffle(whiteDeck)
        shuffle(blackDeck)

        //TODO shuffle decks`

        let initialCards = 7;
        currentGame.public.players = currentGame.players.map((player) => {
          return { username: player.username, socketId: player.socketId, score: 0 };
        });
        //
        // function updateClientState(eventName) {
        //   for (player of currentGame.players) {
        //     lobby.to(player.socketId).emit(eventName, {public: currentGame.public, private: player});
        //   }
        // }

        // Deal cards to each player
        // let csar = Math.floor(Math.random() * Math.floor(players.length));
        for (let player of currentGame.players) {
          player.cards = [];
          for (let i = 0; i < initialCards; i++) {
            player.cards.push({content: whiteDeck.shift(), owner: player.socketId});
          }
          lobby.to(player.socketId).emit('start game', {public: currentGame.public, private: player});
        }
        selectingPhase();

        function selectingPhase() {
          for (let socketId in lobby.connected) {
            lobby.connected[socketId].removeAllListeners('disconnect');
            lobby.connected[socketId].on('disconnect', disconnectDuringSelecting(socketId));
          }

          //restart the round new round round
          // wipe everything
          // eradicate whites
          currentGame.private.whiteCards = [];
          currentGame.public.whiteCards = [];
          // deal cards
          for (let player of currentGame.players) {
            if (player.cards.length !== 7) {
              player.cards.push({ content: whiteDeck.shift(), owner: player.socketId});
            }
          }

          currentGame.private.cardCsarIdx = (currentGame.private.cardCsarIdx + 1) % currentGame.players.length;
          currentGame.public.cardCsar = currentGame.players[currentGame.private.cardCsarIdx].socketId

          currentGame.public.blackCard = blackDeck.shift();
          updateClientState('black card');
          for (let player of currentGame.players) {
            if (player.socketId !== currentGame.public.cardCsar) {
              lobby.connected[player.socketId].once('white card submit',(submittedCard) => {
                console.log(`${submittedCard.owner} selected ${submittedCard.content}`)
                // TODO: cards should have ids instead of filtering on content
                let currPlayer = currentGame.players.find((player) => {
                  return submittedCard.owner === player.socketId;
                });
                currPlayer.cards = currPlayer.cards.filter((card) => {
                  return card.content !== submittedCard.content;
                });
                //put the white card in the private array
                currentGame.private.whiteCards.push(submittedCard);
                // display empty white card to everyone
                currentGame.public.whiteCards.push({content: '', owner: submittedCard.owner});
                updateClientState('game state update');
                if (currentGame.private.whiteCards.length === currentGame.players.length - 1) {
                  judgingPhase();
                }
              });
            }
          }
        }

        function judgingPhase() {
          for (let socketId in lobby.connected) {
            lobby.connected[socketId].removeAllListeners('disconnect');
            lobby.connected[socketId].on('disconnect', disconnectDuringJudging(socketId));
          }

          //get ccard csar to selecto
          currentGame.public.whiteCards = currentGame.private.whiteCards;
          updateClientState('reveal white cards');
          lobby.connected[currentGame.public.cardCsar].once('card selected', (winningCard) => {
            // award points, start next round
            // get winner name
            let winner = winningCard.owner;
            let idx = currentGame.public.players.findIndex((player) => {
              return player.socketId === winner;
            });
            currentGame.public.players[idx].score++;
            // check if the game is over
            if (currentGame.public.players[idx].score === currentGame.public.settings.winningScore) {
              currentGame.public.winner = currentGame.public.players[idx].socketId;
              updateClientState('game over');
              return; //TODO play againstuff here
            }
            selectingPhase();
          });
        }

        function disconnectDuringJudging(socketId) {
          return () => {
            console.log(`${socketId} disconnected during judging`)
            // the person who left was the last person
            if (playerLeft(socketId) === -1) {return}
            currentGame.public.players = currentGame.public.players.filter((player) => {
              return player.socketId !== socketId;
            });
            if (socketId === currentGame.public.cardCsar) {
              console.log('card csar left during judging new round')
              // reduce by one to account new person taking their index spot
              currentGame.private.cardCsarIdx -= 1;
              selectingPhase();
            } else {
              console.log('non card csar left remove their option')
              currentGame.public.whiteCards = currentGame.public.whiteCards.filter((card) => {
                return card.owner === socketId;
              });
              updateClientState('game state update');
            }
          }
        }

        function disconnectDuringSelecting(socketId) {
          return () => {
            console.log(`${socketId} disconnected during selecting`)
            // the person who left was the last person
            if (playerLeft(socketId) === -1) {return}
            currentGame.public.players = currentGame.public.players.filter((player) => {
              return player.socketId !== socketId;
            });
            if (socketId === currentGame.public.cardCsar) {
              console.log('card csar left during selection new round')
              // remove listeners for selecting card
              for (let socketId in lobby.connected) {
                lobby.connected[socketId].removeAllListeners('white card submit');
              }
              // reduce by one to account new person taking their index spot
              currentGame.private.cardCsarIdx -= 1;
              // start new round
              selectingPhase();
            } else {
              let cardIdx = currentGame.private.whiteCards.findIndex((card) => {
                return card.owner === socketId;
              });
              // user had already selected a card
              if (cardIdx !== -1) {
                console.log('someone who selected a card left')
                // remove that card from the options
                currentGame.private.whiteCards.splice(cardIdx, 1);
                currentGame.public.whiteCards.splice(cardIdx, 1);
              }
              if (currentGame.private.whiteCards.length === currentGame.players.length - 1) {
                // if everyone left has submitted
                judgingPhase();
              } else {
                updateClientState('game state update');
              }
            }
          }
        }
      }

      socket.on('disconnect', disconnectDuringLobby);

      function disconnectDuringLobby() {
        console.log(socket.id + 'left during lobby')
        let idx = playerLeft(socket.id);
        if (idx === -1) {
          return
        } else if (idx === 0) {
          // person was room host
          lobby.connected[currentGame.players[0].socketId].on('start game', startGame);
        }
        lobby.emit('player list', currentGame.players);
      }

      function playerLeft(socketId) {
        let idx = currentGame.players.findIndex((player) => {
          return player.socketId === socketId;
        });
        currentGame.players.splice(idx, 1);
        // nobody left, destroy the namespace
        if (currentGame.players.length === 0) {
          // lobby is empty so remove it
          delete currentGame;
          // removes the namespace https://stackoverflow.com/questions/26400595/socket-io-how-do-i-remove-a-namespace
          const connectedSockets = Object.keys(lobby.connected); // Get Object with Connected SocketIds as properties
          connectedSockets.forEach(socketId => {
            lobby.connected[socketId].removeAllListeners('disconnect');
            lobby.connected[socketId].disconnect(); // Disconnect Each socket
          });
          lobby.removeAllListeners();
          delete io.nsps[lobby];
          return -1;
        }
        return idx;
      }
    });
    res.send(roomId);
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))
