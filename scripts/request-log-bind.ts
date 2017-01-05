
import { request } from 'http';
import { Application } from './models/application';
import { getLogModel, getLogModel2, getRequestModel } from './db';
var jsonfile = require('jsonfile');
var file = '../../config/requests.json';
var moment = require("moment");

export class RequestLogBind {
  app: Application;
  working: boolean;

  constructor(config = {}) {
    this.working = false;
    this.app = new Application(config);
  }

  bind() {
    if (this.working)
      return;
    this.working = true;

    let self = this;
    //获取当前未绑定的请求
    let Request = getRequestModel(this.app);
    let cursor = Request.find({logs: {$size: 0 }}).sort({time: 1}).cursor();

    //对每个未绑定的请求，设置其相关的日志
    cursor.on("data", (request) => {
      //console.log(request);
      //console.log("request.logs.length:", request.logs.length);
      if (!request.logs || request.logs.length === 0) {
        this.bindLogs(request);
      }
    }); 

    cursor.on("close", (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("close cursor");
      this.working = false;
      setTimeout(()=> {
          self.bind();
        }, 2000);
    });
  }

  bindLogs(req: any) {
    //console.log("bindLogs: ", req);
    let Log = getLogModel2(this.app);
    Log.find()
       .where('time').gte(req.startLog).lte(req.endLog)
       .where('thread').eq(req.thread)
       .sort({time: 1})
       .exec((err, logs) => {
          if (err) {
            console.log(err);
            return;
          }
          req.logs = logs;
          req.save((saveErr) => {
            if (saveErr) {
              console.log(saveErr);
              return;
            }
            console.log("save success:", moment(req.time).format('YYYY-MM-DD HH:mm:ss,SSS'));
            //console.log(req);
          });
          
          let options = {time: {$gte: req.startLog, $lte: req.endLog}, thread: req.thread };
          console.log(JSON.stringify(options));
          Log.update({time: {$gte: req.startLog, $lte: req.endLog}, thread: req.thread },
             { $set: { reqId: req._id }}, {multi: true}).exec( (err) => {
               if (err) {
                 console.log(err);
                 return;
               }
               console.log("update logs success");
             });
          /*
          logs.forEach( log => {
            log.reqId = req._id;
            log.save();
          });*/
       });
  }
}

var config = jsonfile.readFileSync(file);
var binder = new RequestLogBind(config);
binder.bind();

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`);
  setTimeout(binder.bind, 5000);
});
