'use strict';

/*
 * nodejs-express-mongoose-demo
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

require('dotenv').config();

var fs = require('fs');
const join = require('path').join;
const express = require('express');
var mongoose = require('mongoose');
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

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  //连接mongodb
  return mongoose.connect(config.db, options).connection;
}
