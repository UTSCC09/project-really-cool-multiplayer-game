require("dotenv").config()
const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/db")

app.use(express.static(path.join(__dirname, "client", "build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))