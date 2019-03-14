//https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274
//https://medium.com/@bogna.ka/integrating-google-oauth-with-express-application-f8a4a2cf3fee
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');
const googleAuth = require('./googleAuth.js');
googleAuth(passport);
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

const dbRoute = "mongodb://localhost:27017/db";
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);
let db = mongoose.connection;
db.once("open", () => console.log("connected to the database"));
// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));
///////////////


const PORT = 3000;
const app = express();
const router = express.Router();
var isAuthenticated = function(req, res, next) {
    if (!req.session.token) return res.status(401).end("access denied");
    next();
};

// // bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));
app.use(cookieParser());

// SERVER ROUTES
// CREATE
app.post('/deck/', isAuthenticated, function(req, res) {

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
  res.redirect('/');
});

app.get('/logout', function (req, res) {
    req.logout();
    req.session = null;
    res.redirect('/');
});


app.get('/deck/:id/', function(req, res) {

});

app.get('user/:id/', function(req, res) {

});


// UPDATE
app.put('/deck/:id/', function(req, res) {

});

app.put('deck/:id/', function(req, res) {

});

// DELETE
app.delete('/deck/:id/', function(req, res) {

});

app.delete('deck/:id/', function(req, res) {

});





app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
