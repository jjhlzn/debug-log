var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
export var db = mongoose.createConnection('mongodb://115.29.199.187/debug_log');
db.on('error', (err) => {
  console.error(err);
});

/*
export var Log = db.model('Log', { 
  time:    String,   //2015-03-18 00:04:26,442
  level:   String,   //Debug
  clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
  content: String,
  thread: String    
});*/

/*
export var Applicaton = db.model('Application', {
  application: String,
  parsePositoin: Number,
  parsetime: Date
});*/




