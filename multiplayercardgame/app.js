var express = require('express');

var app = express();

app.get("/", (req, res, next) => {
  res.redirect('https://www.youtube.com/watch?v=6n3pFFPSlW4');
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});