var mongoose = require('mongoose');
var assert = require('assert');

mongoose.Promise = require('bluebird');
var db = mongoose.createConnection('mongodb://115.29.199.187/debug_log');

var Log = db.model('Log', { 
  time:    String,   //2015-03-18 00:04:26,442
  level:   String,   //Debug
  clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
  content: String    
});

var log = new Log({
  time: '2016-01-01',
  level: 'DEBUG',
  clazz: 'hd.order',
  content: 'xxxxxxxxxxxxxx'
});

log.save((err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log('save success');
});