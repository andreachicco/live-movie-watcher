const express = require('express');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');

if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const dbUri = process.env.DB_URI;

mongoose.connect(dbUri, (err) => {
  if(err) console.error(err);
  else console.log('Database Connected');
});

const io = require('./socket');

const homeRoute = require('./routes/home.route');
const roomRoute = require('./routes/room.route');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app);
io.init(server);

app.use('/', homeRoute);
app.use('/room', roomRoute);

const serverPort = process.env.PORT;

server.listen(serverPort, () => {
  console.log(`Listening on *:${serverPort}`);
});