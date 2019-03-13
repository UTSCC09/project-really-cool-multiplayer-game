var express = require('express');

var app = express();

app.get("/", (req, res, next) => {
  res.redirect('https://www.youtube.com/watch?v=6n3pFFPSlW4');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))