//https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274
//https://medium.com/@bogna.ka/integrating-google-oauth-with-express-application-f8a4a2cf3fee
//https://stackoverflow.com/questions/39183392/deploying-nodejs-mongoose-to-heroku
require("dotenv").config();

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const passport = require('passport');
const googleAuth = require('./auth/googleAuth.js');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

//DB stuff
const userScheme = new mongoose.Schema({
  googleId: String,
  email: String
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

const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();
var isAuthenticated = function(req, res, next) {
  if (!req.session.token) return res.status(401).end("access denied");
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
    if (err) return res.status(500).end("Error");
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
  req.session.token = req.user.token;
  // Add the user to the DB
  let email = req.user.profile.email;
  let googleId = req.user.profile.id;
  let update = {"$set": {email: email, googleId: googleId}}
  let option = {new: true, upsert: true};
  User.findOneAndUpdate({email: email}, update, option).exec(function(err, user) {
    if (err) return res.send(500, { error: err });
    // set details:
    req.session.userId = user._id;
  })
  res.redirect('/');
});

app.get('/logout/', function (req, res) {
    req.logout();
    req.session = null;
    res.redirect('/');
});

app.get('/api/deck/:id/', function(req, res) {
  let id = req.params.id;
  Deck.findById(id, function(err, deck) {
    if (err) return res.send(500, {error : err});
    else if (user === null) return res.send(404, {error: 'Deck not found'});
    else return res.json(deck);
  });
});

app.get('/api/user/:id/', function(req, res) {
  let id = req.params.id;
  User.findById(id, function(err, user) {
    if (err) return res.send(500, {error : err});
    else if (user === null) return res.send(404, {error: 'User not found'});
    else return res.json(user);
  });
});

// UPDATE
app.put('/api/deck/:id/', function(req, res) {
  let id = req.params.id;
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
  let id = req.params.id;
  Deck.findByIdAndDelete(id, function(err, deck) {
    if (err) return res.send(500, { error: err });
    else if (deck === null) return res.send(404, {error: "Deck does not exist"});
    else return res.json(deck);
  });
});

app.delete('/api/user/:id/', function(req, res) {
  let id = req.params.id;
  User.findByIdAndDelete(id, function(err, user) {
    if (err) return res.send(500, { error: err });
    else if (user === null) return res.send(404, {error: "User does not exist"});
    else return res.json(user);
  });
});

app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
