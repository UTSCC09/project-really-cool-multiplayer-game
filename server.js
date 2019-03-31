//https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274
//https://medium.com/@bogna.ka/integrating-google-oauth-with-express-application-f8a4a2cf3fee
//https://stackoverflow.com/questions/39183392/deploying-nodejs-mongoose-to-heroku
require("dotenv").config();

const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
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
  photo: String,
  givenName: String,
  familyName: String,
  friends: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  incomingRequests: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  pendingRequests: { type: [mongoose.Schema.Types.ObjectId], default: [] },
});

const MINIMUM_CARDS_WHITE = 60;
const MINIMUM_CARDS_BLACK = 10;
const deckScheme = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['WHITE', 'BLACK'] },
  ownerId: mongoose.Schema.Types.ObjectId,
  cards: [String],
});

var User = mongoose.model('User', userScheme);
var Deck = mongoose.model('Deck', deckScheme);


mongoose.connect(process.env.MONGODB_URI || "mongodb://test:test123@ds213896.mlab.com:13896/heroku_nz567lg6", { useNewUrlParser: true });
let db = mongoose.connection;

console.log("DB running on: " + (process.env.MONGODB_URI || "mongodb://test:test123@ds213896.mlab.com:13896/heroku_nz567lg6"));

db.once("open", () => console.log("connected to the database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const PORT = process.env.PORT || 5000;
const router = express.Router();
var isAuthenticated = function(req, res, next) {
  if (!req.session.token) return res.status(401).send({error: "Access denied"});
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
  let deckContent = sanitize(req.body.content);
  let deckName = sanitize(req.body.name);
  let deckType = sanitize(req.body.type);
  if (deckType !== "WHITE" && deckType !== "BLACK") return res.status(400).send({error: "Deck type must be either WHITE or BLACK"})
  let deckContentUnique = new Set(deckContent);
  deckContent = Array.from(deckContentUnique);
  let min = (deckType === "WHITE" ? MINIMUM_CARDS_WHITE : MINIMUM_CARDS_BLACK)
  if (deckContent.length < min) {
    return res.status(400).send({ error: "Not enough unique cards in deck, " + deckType + " decks must have at least " + min});
  }

  let newDeck = new Deck({name: deckName, type: deckType, cards: deckContent, ownerId: req.session.id});
  newDeck.save(function(err, newDeck) {
    if (err) return res.status(500).send({error: err});
  });
  return res.json(newDeck._id);
});

var multer  = require('multer')
var upload = multer();

// READ
app.get('/', function (req, res, next) {
  res.cookie('token', req.session.token || '');
  res.cookie('id', req.session.id || '');
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
    photo: req.user.profile.photos[0].value,
    googleId: req.user.profile.id,
    givenName: sanitize(req.user.profile.name.givenName),
    familyName: sanitize(req.user.profile.name.familyName),
  }
  let option = {new: true, upsert: true, setDefaultOnInsert: true};
  User.findOneAndUpdate({googleId: req.user.profile.id}, update, option).exec(function(err, user) {
    if (err) return res.status(500).send({ error: err });
    req.session.id = user._id;
    res.redirect('/');
  });
});

app.get('/logout/', function (req, res) {
    req.logout();
    let update = {token: ""}
    User.findOneAndUpdate({token: req.session.token}, update, function(err, user) {
      if (err) return res.status(500).send({ error: err });
    })
    req.session = null;
    res.redirect('/');
});

app.get('/api/deck/:id/', function(req, res) {
  let id = sanitize(req.params.id);
  Deck.findById(id, function(err, deck) {
    if (err) return res.status(500).send({error : err});
    else if (user === null) return res.status(404).send({error: 'Deck not found'});
    else return res.json(deck);
  });
});

app.get('/api/user/:id/', function(req, res) {
  let id = sanitize(req.params.id);
  User.findById(id, function(err, user) {
    if (err) return res.status(500).send({error : err});
    else if (user === null) return res.status(404).send({error: 'User not found'});
    else {
      // Check for token in header
      let token = req.get('token');
      if (token === user.token) {
        return res.json(user);
      } else {
        let publicUserInfo = {
          givenName: user.givenName,
          familyName: user.familyName,
          friends: user.friends,
          photo: user.photo,
        }
        return res.json(publicUserInfo);
      }
    }
  });
});

app.get('/api/user/:id/friend/', function(req, res) {
  let id = sanitize(req.params.id);
  User.findById(id, 'friends', function(err, user) {
    if (err) return res.status(500).send({error: err});
    else if (user === null) return res.status(404).send({error: 'User not found'});
    else if (user.friends.length === 0) return res.json([]);
    else {
      User.find({ '_id': { $in: user.friends } }, "friends photo givenName familyName", function(err, users) {
        if (err) return res.status(500).send({error: err});
        else if (users === null) return res.json([]);
        else return res.json(users);
      });
    }
  });
});

app.get('/api/user/:id/friend/requests/', function(req, res) {
  let id = sanitize(req.params.id);
  let token = req.get('token');
  let type = req.query.type; // "incoming" || "pending"
  if (!token) {
    return res.status(401).send({error: "No auth token"});
  } else if (type !== "incoming" && type !== "pending") {
    return res.status(400).send({error: "Incorrect request type: '"+ type + "'. Must be either 'incoming' or 'pending'."})
  }
  let field;
  switch(type) {
    case "incoming": field = "incomingRequests"; break;
    case "pending": field = "pendingRequests"; break;
    default: break;
  }

  User.findById(id, field + " token", function(err, user) {
    if (err) return res.status(500).send({error: err});
    else if (user === null) return res.status(404).send({error: 'User not found'});
    else if (user.token !== token) return res.status(401).send({error: 'User not authorized'});
    else if (user[field].length === 0) return res.json([]);
    else {
      User.find({ '_id': { $in: user[field] } }, "friends photo givenName familyName", function(err, users) {
        if (err) return res.status(500).send({error: err});
        else if (users === null) return res.json([]);
        else return res.json(users);
      });
    }
  });
});

app.get('/api/user/:id/decks/', function(req, res) {
  let id = sanitize(req.params.id);
  Deck.find({ownerId:id}, function(err, decks) {
    if (err) return res.status(500).send({error: err});
    else return res.json(decks);
  });
});

// get decks belonging to your current user
app.get('/api/user/:id/decks/',  function(req, res) {
  let id = sanitize(req.params.id);
  Deck.find({ownerId:id}, function(err, cards) {
    if (err) return res.status(500).send({error: err});
    else return res.json(cards);
  });
});

app.get('/api/lobby/:id/status', function(req, res) {
  let lobby = games[req.params.id];
  if (!lobby) {
    res.status(404).end();
  } else {
    let message
    if (lobby.phase !== 'lobby') {
      message = 'game is already in progress';
    } else if (lobby.numPlayers >= 8) {
      message = 'game lobby is full';
    }
    res.status(200).send(message);
  }
});

app.get('/api/lobby/join', function(req, res) {
  let lobby;
  for (game in games) {
    if (games[game].phase === 'lobby' && games[game].numPlayers < 8) {
      lobby = game;
      break;
    }
  }
  res.status(200).send(lobby);
});

// UPDATE
app.put('/api/user/:id/friend/', function(req, res) {
  let recipientId = sanitize(req.params.id);
  let senderId = sanitize(req.body.id);
  let requestType = req.body.requestType; // "SEND || ACCEPT || DECLINE";
  let token = req.get('token');

  if (requestType !== "SEND" && requestType !== "ACCEPT" && requestType !== "DECLINE") {
    return res.status(400).send({error: "Incorrect request type: '"+ requestType + "'. Must be either 'SEND', 'ACCEPT', or 'DECLINE'."});
  } else if (!token) {
    return res.status(401).send({error: "No auth token"});
  } else if (senderId === recipientId) {
    return res.status(400).send({error: "Identical Ids"});
  }

  // sender -> guy doing a thing on the client (sending the request, accepting the request or declining the request)
  // recipient -> the other one
  User.findById(senderId, function(err, sender) {
    if (err) return res.status(500).send({error: err});
    else if (sender === null) return res.status(404).send({error: "Sending user:" + senderId + " not found"});
    else {
      if (!sender.token || sender.token !== token) return res.status(401).send({error: "User not authorized"});
      User.findById(recipientId, function(err, recipient) {
        if (err) return res.status(500).send({error: err});
        else if (recipient === null) return res.status(404).send({error: "Recipient user:" + recipientId + " not found"});
        else {
          let senderUpdate = {}
          let recipientUpdate = {}
          if (requestType === "SEND") {
            senderUpdate = { $addToSet: { pendingRequests: recipientId } };
            recipientUpdate = { $addToSet: { incomingRequests: senderId } };
          } else {

            // check if there was a friend request from recipient to sender already
            // if not, send error
            if (!(sender.incomingRequests.indexOf(recipientId) !== -1) || !(recipient.pendingRequests.includes(senderId + "") !== -1)) {
              return res.status(400).send({error: "User: " + recipientId + " has not sent a request to user: " + senderId});
            }

            senderUpdate = { $pull: { incomingRequests: recipientId } };
            recipientUpdate = { $pull: { pendingRequests: senderId } };

            if (requestType === "ACCEPT") {
              senderUpdate.$addToSet = { friends: recipientId };
              recipientUpdate.$addToSet = { friends: senderId };
            }
          }

          User.updateOne({_id: recipientId}, recipientUpdate, function(err, raw) {
            if (err) return res.status(500).send({error: err});
          });
          User.updateOne({_id: senderId}, senderUpdate, function(err, raw) {
            if (err) return res.status(500).send({error: err});
          });
          res.json({});
        }
      });
    }
  });
});


app.put('/api/deck/:id/', function(req, res) {
  let id = sanitize(req.params.id);
  let deckContent = sanitize(req.body.content);
  let deckName = sanitize(req.body.name);
  let deckType = sanitize(req.body.type);
  if (deckType !== "WHITE" && deckType !== "BLACK") return res.status(400).send({error: "Deck type must be either WHITE or BLACK"})
  let deckContentUnique = new Set(deckContent);
  deckContent = Array.from(deckContentUnique);
  let min = (deckType === "WHITE" ? MINIMUM_CARDS_WHITE : MINIMUM_CARDS_BLACK)
  if (deckContent.length < min) {
    return res.status(400).send({ error: "Not enough unique cards in deck, " + deckType + " decks must have at least " + min});
  }
  let update = {name: deckName, type: deckType, cards: deckContent};
  Deck.findByIdAndUpdate(id, update, function(err, deck) {
    if (err) return res.status(500).send({ error: err });
    else if (deck === null) return res.status(404).send({error: "Deck does not exist"});
    else return res.json(deck);
  });
});

// DELETE
app.delete('/api/deck/:id/', function(req, res) {
  let id = sanitize(req.params.id);
  Deck.findByIdAndDelete(id, function(err, deck) {
    if (err) return res.status(500).send({ error: err });
    else if (deck === null) return res.status(404).send({error: "Deck does not exist"});
    else return res.json(deck);
  });
});

app.delete('/api/user/:id/', function(req, res) {
  let id = sanitize(req.params.id);
  User.findByIdAndDelete(id, function(err, user) {
    if (err) return res.status(500).send({ error: err });
    else if (user === null) return res.status(404).send({error: "User does not exist"});
    else return res.json(user);
  });
});

app.use(express.static(path.join(__dirname, "client", "build")));

// contains arrays of the usernames of people in a lobby, indexed by lobby id
let games = {};

app.get('/api/create-room/', (req, res) => {
    let roomId = crypto.randomBytes(5).toString('hex');
    // generate ids until we get one not being used
    while (games[roomId]) {
      roomId = crypto.randomBytes(5).toString('hex');
    }
    console.log(`new room ${roomId}`)
    games[roomId] = {numPlayers: 0, phase: "lobby"};
    let currentGame = { public: {}, players: [] };

    function updateClientState(eventName) {
      for (let player of currentGame.players) {
        lobby.to(player.socketId).emit(eventName, {public: currentGame.public, private: player});
      }
    }

    let lobby = io.of(roomId);
    lobby.on('connection', (socket) => {
      console.log("person connected")

      socket.on('join', (username, callback) => {
        if (games[roomId].numPlayers < 8) {
          games[roomId].numPlayers++;
        } else {
          socket.disconnect();
        }
        console.log(`${username} joined ${roomId}`)
        console.log(`${username}: ${socket.id}`)
        if (currentGame.players.length === 0) {
          socket.on('start game', startGame);
        }
        currentGame.players.push({username, socketId: socket.id});
        if (callback) {
          callback(socket.id);
        }
        socket.on('chat message', (message) => {
          // convert to string because while react deals with xss on its own, if it's passed an object it'll mess things up
          lobby.emit('chat message', {user: username, content: String(message)});
        });
        lobby.emit('player list', currentGame.players);
      });

      async function startGame(settings) {
        // not enough people to start game
        if (currentGame.players.length < 3) {
          return;
        }
        // remove start game listener so can't start game multiple times
        lobby.connected[currentGame.players[0].socketId].removeAllListeners('start game');
        // remove connection listener so new people can't join a room in progress
        lobby.removeAllListeners('connection');
        games[roomId].phase = "playing";
        console.log("Game Settings:", settings);
        for (let socketId in lobby.connected) {
          // remove disconnect event for when in lobby
          lobby.connected[socketId].removeAllListeners('disconnect');
        }
        console.log(`start game: ${roomId}`);

        // Decide what game to play/ what deck to use here
        // Default cards against humanity is default here
        // fetch (get deck from database here)

        // Host decided settings are set here for the game

        let whiteDeckId = sanitize(settings.whiteDeckId);
        let blackDeckId = sanitize(settings.blackDeckId);

        if (!whiteDeckId || whiteDeckId === "default") {
          whiteDeckId = "5c8dc89d47e8042ba5673c20";
        }
        if (!blackDeckId || blackDeckId === "default") {
          blackDeckId = "5c8dc7c0b6aa482b6f8ac885";
        }

        currentGame.public = {
          blackCard: "",
          cardCsar: '',
          settings: {winningScore: Number(settings.winningPoints)},
          players: [],  // {username, score}
          whiteCards: [],
          winner: '',
        }


        // server only
        currentGame.private = {
          whiteCards: [], // {owner: socketId of the owner, content: string of its contents}
          cardCsarIdx: currentGame.players.length - 1
        }

        let whiteDeck = (await Deck.findById(whiteDeckId)).cards;
        let blackDeck = (await Deck.findById(blackDeckId)).cards;
        let whiteDiscards = [];
        let blackDiscards = [];

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

        let initialCards = 7;
        currentGame.public.players = currentGame.players.map((player) => {
          return { username: player.username, socketId: player.socketId, score: 0 };
        });

        // Deal cards to each player
        // let csar = Math.floor(Math.random() * Math.floor(players.length));
        for (let player of currentGame.players) {
          player.cards = [];
          for (let i = 0; i < initialCards; i++) {
            player.cards.push({content: whiteDeck.shift(), owner: player.socketId});
            if (whiteDeck.length === 0) {
              whiteDeck = whiteDiscards;
              shuffle(whiteDeck);
              whiteDiscards = [];
            }

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

          blackDiscards.push(currentGame.public.blackCard);
          currentGame.public.blackCard = blackDeck.shift();
          if (blackDeck.length === 0) {
            blackDeck = blackDiscards;
            shuffle(blackDeck);
            blackDiscards = [];
          }

          updateClientState('black card');
          for (let player of currentGame.players) {
            if (player.socketId !== currentGame.public.cardCsar) {
              let submitCard = (submittedCard) => {
                console.log(`${submittedCard.owner} selected ${submittedCard.content}`)
                whiteDiscards.push(submittedCard.content);
                // TODO: cards should have ids instead of filtering on content
                let currPlayer = currentGame.players.find((player) => {
                  return submittedCard.owner === player.socketId;
                });
                let idx = currPlayer.cards.findIndex((card) => {
                  return card.content === submittedCard.content;
                });
                if (idx === -1) {
                  // the card wasn't a card in the player's hand. i.e. cheating
                  lobby.connected[player.socketId].once('white card submit', submitCard);
                  return;
                }
                currPlayer.cards.splice(idx, 1);
                //put the white card in the private array
                currentGame.private.whiteCards.push(submittedCard);
                // display empty white card to everyone
                currentGame.public.whiteCards.push({ content: '', owner: submittedCard.owner });
                updateClientState('game state update');
                if (currentGame.private.whiteCards.length === currentGame.players.length - 1) {
                  judgingPhase();
                }
              }
              lobby.connected[player.socketId].once('white card submit', submitCard);
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
            console.log(idx);
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
            let disconnectedPlayer = currentGame.players.find((player) => {
              return player.socketId === socketId;
            });
            if (disconnectedPlayer) {
              for (let card of disconnectedPlayer.cards) {
                whiteDiscards.push(card.content);
              }
            }

            if (socketId === currentGame.public.cardCsar) {
              console.log('card csar left during judging new round')
              // reduce by one to account new person taking their index spot
              currentGame.private.cardCsarIdx -= 1;
              selectingPhase();
            } else {
              console.log('non card csar left remove their option')
              currentGame.public.whiteCards = currentGame.public.whiteCards.filter((card) => {                
                return card.owner !== socketId;
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
            let disconnectedPlayer = currentGame.players.find((player) => {
              return player.socketId === socketId;
            });
            if (disconnectedPlayer) {
              for (let card of disconnectedPlayer.cards) {
                whiteDiscards.push(card.content);
              }
            }

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
        games[roomId].numPlayers--;
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
          delete games[roomId];
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
