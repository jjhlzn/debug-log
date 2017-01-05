var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
export var db = mongoose.createConnection('mongodb://115.29.199.187/debug_log');
db.on('error', (err) => {
  console.error(err);
});




