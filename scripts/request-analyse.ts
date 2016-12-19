import { isDuration } from 'moment';
import { log } from 'util';
import * as console from 'console';
import { db } from './models/models';
var jsonfile = require('jsonfile');
import { Application } from './models/application';
var file = '../../config/requests.json';
var moment = require('moment');


class RequestAnalyzer {
  app: any;
  Log: any;
  Request: any;

  constructor(config = {}) {
    this.app = new Application(config);
    this.Log = db.model('Log', { 
      time:    String,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String    
    }, "logs_"+this.app.name);

    this.Request = db.model('Request', {
      time: String,
      ip: String,
      duration: Number,
      url: String,
      startLog: String,
      endLog: String,
      thread: String
    }, "requests_"+this.app.name);
  }

  analyse() {
    let self = this;
    //查询开始标志
    console.log("lastParseLog: ", this.app.lastParseLog);
    let cursor = self.Log.
      find({ content: /##############################################.*/ }).
      where('time').gt(self.app.lastParseLog).cursor();

    //真对每个开始标记，查询对应的结束的标记，然后纪录请求，纪录请求的开始日志和结束日志。
    cursor.on("data", (doc) => {
      //console.log(doc);

      let regex = new RegExp("^##############################################IP: (.+)#(.+) 开始处理##############################################");
      let m = regex.exec(doc.content);

      if (m == null) return;

      //
      let ip = m[1], url = m[2];
      self.Log.findOne({content: `---------------------------------------------${url} 处理结束---------------------------------------------`,
         thread: doc.thread, clazz: doc.clazz, "time": {$gt: doc.time}}).exec( (err, endLog) => {
        if (err) {
          console.log(err);
          return;
        }
        //console.log("endLog:", endLog);
        if (endLog != null) {
          let duration = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').diff(moment(doc.time, 'YYYY-MM-DD HH:mm:ss,SSS'));
          
          let request = new self.Request({
            time: doc.time,
            ip: ip,
            url: url,
            startLog: doc.time,
            endLog: endLog.time,
            thread: doc.thread,
            duration: duration
          });

          request.save(err => {
            if (err) {
              console.log("err: ", err);
            }
            console.log(doc.time, m[1], m[2]);
            self.app.lastParseLog = endLog.time;
            jsonfile.writeFileSync(file, self.app.toRequestJson());

        });  
        } else {
          console.warn("can't find end log");
        }
      });
    });
    cursor.on("close", () => {
      console.log("read complete");
      jsonfile.writeFileSync(file, self.app.toRequestJson());
    });

  }
}

var config = jsonfile.readFileSync(file);
new RequestAnalyzer(config).analyse();