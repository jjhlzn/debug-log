import { log } from 'util';

var mongoose = require('mongoose');
var assert = require('assert');
var moment = require('moment');

var db = mongoose.connection;
var dbURI = 'mongodb://114.215.170.159/debug_log';
db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});

db.on('error', function(error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', function() {
  console.log('MongoDB connected!');
});
db.once('open', function() {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
  console.log('MongoDB disconnected!');
  mongoose.connect(dbURI, {server:{auto_reconnect:true}});
});

mongoose.Promise = require('bluebird');
mongoose.connect(dbURI, {server:{auto_reconnect:true}});

function getLogModel(app: any) {
    let modelName = `logs_${app}_${moment().format('YYYY-MM-DD')}`;
    console.log("modelName: ", modelName);
    return db.model(modelName, { 
      time:    {type: Date,  index: true}, //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String,
      app: String,
      reqId: String    
    }, modelName);
}

let Log = getLogModel('test');

function findEndLog(log) {
  let regex = new RegExp("^##############################################IP: (.+)#(.+) 开始处理##############################################");
  let m = regex.exec(log.content);
  //console.log("startLog:", JSON.stringify(log));
  //console.log("startLog:", log.time, log.content);
  if (m == null) { 
    return;
  }

  let ip = m[1], url = m[2];
  let maxEndTime = new Date(moment(log.time).add(1, 'm'));
  let options = {content: `---------------------------------------------${url} 处理结束---------------------------------------------`,
                 thread: log.thread, clazz: log.clazz, time: {$gte: log.time, $lte: maxEndTime}};
  Log.findOne(options)
    .sort({time: 1})
    .exec( (err, endLog) => {
      if (err) {
        console.log(err);
        return;
      }
      //console.log("endLog:", JSON.stringify(endLog));
      //console.log(JSON.stringify(logs));
      if (endLog != null) {
        //console.log("endLog:", endLog.time, endLog.content);
      }else {
        console.log("can't find endLog: ", JSON.stringify(log));
      }
    });
}


var startTime = '2017-01-06 10:52:09,029';
console.log(new Date(moment(startTime, 'YYYY-MM-DD HH:mm:ss,SSS').toISOString()));
Log.find({ content: /##############################################.*/ })
                  .where('time').gte(new Date(moment(startTime, 'YYYY-MM-DD HH:mm:ss,SSS')))
                  //.limit(5)
                  .sort({time: 1})
                  .exec( (err, logs) => {
                    if (err) {
                      console.log(err);
                      return;
                    }
                    //console.log(JSON.stringify(logs));
                    logs.forEach(log => {
                      findEndLog(log);
                    });
                    
                    
                  });

