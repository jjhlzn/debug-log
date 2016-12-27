require('dotenv').config();

var fs = require('fs');
const join = require('path').join;
const express = require('express');
var mongoose = require('mongoose');
var mongodb = require('mongodb');
var socketio = require("socket.io");
const config = require('./config');
const morgan = require('morgan');

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 4000;
const app = express();

/**
 * Expose
 */
module.exports = app;

app.use(morgan('dev'));

// Bootstrap models 
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file))); 

// Bootstrap routes
require('./config/routes')(app);
//var io = socketio.listen(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

setupMongoSocketIO();

function setupMongoSocketIO() {
  mongodb.MongoClient.connect (config.db, function (err, db) {
    db.collection('requests_capped', function(err, collection) {
      // open socket
      io.sockets.on("connection", function (socket) {
        // open a tailable cursor
        console.log("== open tailable cursor");
        collection.find({}, {tailable:true, awaitdata:true, numberOfRetries:-1})
          //.sort({ time: 1 })
          .each(function(err, doc) {
            console.log(doc);
            // send message to client
            //if (doc.type == "message") {
            socket.emit("new request",doc);
            //}
        });
      });
    });
  
    db.on('error', (err) => {
      console.log(err);
      setupMongoSocketIO();
    });
  });
}

function listen () {
  if (app.get('env') === 'test') return;
  server.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  //连接mongodb
  return mongoose.connect(config.db, options).connection;
}
