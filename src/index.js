const os = require('os');
const cluster = require('cluster');

if(process.env.NODE_ENV !== 'production') require('dotenv').config();

if(cluster.isMaster) {
  let nCpus = os.cpus().length;

  //Check if the inserted env var is ok 
  if(process.env.NCPUS <= nCpus) nCpus = process.env.NCPUS;

  console.log(`Forking on ${nCpus} CPUs`);
  for(let i = 0; i < nCpus; ++i) cluster.fork();
}
else {
  const express = require('express');
  const path = require('path');
  const http = require('http');
  const morgan = require('morgan');
  const { database } = require('./mongoose');
  
  const dbUri = process.env.DB_URI;
  database.connectDatabase(dbUri);
  
  const io = require('./socket');
  
  const homeRoute = require('./routes/home.route');
  const roomRoute = require('./routes/room.route');
  
  const app = express();
  
  app.use(morgan('dev'));
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: true }))
  
  const server = http.createServer(app);
  io.init(server);
  
  app.use('/', homeRoute);
  app.use('/room', roomRoute);
  
  const serverPort = process.env.PORT;
  
  const pid = process.pid;
  server.listen(serverPort, () => {
    console.log(`Server: process ${pid} is listening on *:${serverPort}`);
  });
}
