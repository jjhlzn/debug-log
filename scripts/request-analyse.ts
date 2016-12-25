import { db } from './models/models';
import { getLogModel2, getRequestModel } from './db';
var jsonfile = require('jsonfile');
import { Application } from './models/application';
var file = '../../config/requests.json';
var moment = require('moment');

class RequestAnalyzer {
  app: any;

  constructor(config = {}) {
    this.app = new Application(config);
  }

  analyse() {
    let self = this;
    //查询开始标志
    console.log("lastParseLog: ", this.app.lastParseLog);
    let Log = getLogModel2(this.app);
    let Request = getRequestModel(this.app);

    let cursor = null;

    if (this.app.lastParseLog === '') {
      cursor = Log.
      find({ content: /##############################################.*/ }).cursor();
    } else {
      cursor = Log.
                  find({ content: /##############################################.*/ }).
                  where('time').gt(new Date(moment(this.app.lastParseLog, 'YYYY-MM-DD HH:mm:ss,SSS').toISOString()))
                  .cursor();
    }

    //真对每个开始标记，查询对应的结束的标记，然后纪录请求，纪录请求的开始日志和结束日志。
    cursor.on("data", (doc) => {
      let regex = new RegExp("^##############################################IP: (.+)#(.+) 开始处理##############################################");
      let m = regex.exec(doc.content);

      if (m == null) return;

      let ip = m[1], url = m[2];
      let maxEndTime = moment(doc.time).add(1, 'm');
      //console.log("start:", doc.time, ", end:", maxEndTime);
      Log.findOne({content: `---------------------------------------------${url} 处理结束---------------------------------------------`,
         thread: doc.thread, clazz: doc.clazz})
         .where("time").gt(doc.time).lt(maxEndTime)
         .sort({time: 1}).exec( (err, endLog) => {
        if (err) {
          console.log(err);
          return;
        }
        //console.log("endLog:", endLog._id);
        if (endLog != null) {
          let duration = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').diff(moment(doc.time, 'YYYY-MM-DD HH:mm:ss,SSS'));
          if (duration > 1000 * 10) {
            console.log("path:", doc.path, ", starttime:", doc.time, ", endtime:", endLog.time);
          }
          let request = new Request({
            time: doc.time,
            ip: ip,
            url: url,
            startLog: doc.time,
            endLog: endLog.time,
            thread: doc.thread,
            duration: duration
          });

          //console.log("save request:", endLog._id);
          request.save(err => {
            if (err) {
              console.log("err: ", err);
              return;
            }
            //console.log(moment(doc.time).format('YYYY-MM-DD HH:mm:ss,SSS'), m[1], m[2]);
            self.app.lastParseLog = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').format('YYYY-MM-DD HH:mm:ss,SSS');
            jsonfile.writeFileSync(file, self.app.toRequestJson());
        });  
        } else {
          console.warn("can't find end log");
        }
      });
    });
    cursor.on("close", () => {
      console.log("read db complete");
      setTimeout(()=> {
          self.analyse();
        }, 2000);
    });

  }
}

var config = jsonfile.readFileSync(file);
new RequestAnalyzer(config).analyse();