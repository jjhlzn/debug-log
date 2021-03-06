import { getLogModel2, getRequestModel, getCappedRequestModel } from './db';
var jsonfile = require('jsonfile');
import { Application } from './models/application';
var file = '../../config/requests.json';
var moment = require('moment');

class RequestAnalyzer {
  app: any;
  working: boolean;

  constructor(config = {}) {
    this.app = new Application(config);
    this.working = false;
  }

  analyse() {
    if (this.working) {
      console.log("analyse is working, return");
      return;
    }
    this.working = true;
    
    let self = this;

    //查询开始标志
    //console.log("lastParseLog: ", this.app.lastParseLog);
    let Log = getLogModel2(this.app);
    let Request = getRequestModel(this.app);
    let CappedRequest = getCappedRequestModel();

    let cursor = null;

    cursor = Log.
                find({ content: /##############################################.*/ }).
                where('reqId').eq(null).
                where('time').gt(moment().subtract(3, 'm').toISOString()).lt((moment().subtract(10, 's').toISOString()))
                .cursor();
    
 
    //真对每个开始标记，查询对应的结束的标记，然后纪录请求，纪录请求的开始日志和结束日志。
    cursor.on("data", (doc) => {
      let regex = new RegExp("^##############################################IP: (.+)#(.+) 开始处理##############################################");
      let m = regex.exec(doc.content);

      if (m == null) return;

      let ip = m[1], url = m[2];
      let maxEndTime = moment(doc.time).add(1, 'm');

      //检查这个请求是否在Request中
      Request.findOne({
        startLog: doc.time,
        thread: doc.thread,
        url: url
      }).exec( (err, req) => {
        if (err) {
          console.error(err);
          return;
        }
        
        if (req) {
          //console.log(req);
          return;
        }

        console.log("found a non-parsed request: ", moment(doc.time).format('HH:mm:ss,SSS'), url);
        //这是一个漏过的请求的

        let options = {content: `---------------------------------------------${url} 处理结束---------------------------------------------`,
         thread: doc.thread, clazz: doc.clazz, time: {$gte: new Date(doc.time), $lte: new Date(maxEndTime)}};
         console.log(options);
        Log.findOne(options)
           .sort({time: 1}).exec( (err, endLog) => {
          if (err) {
            console.log(err);
            return;
          }

          if (endLog != null) {
            let duration = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').diff(moment(doc.time, 'YYYY-MM-DD HH:mm:ss,SSS'));
            //高延迟请求
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
              duration: duration,
              app: this.app.name
            });
  
            let request2 = new CappedRequest(request);
            request.save(err => {
              if (err) {
                console.log("err: ", err);
                return;
              }
              console.log(moment(doc.time).format('YYYY-MM-DD HH:mm:ss,SSS'), m[1], m[2]);
              self.app.lastParseLog = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').format('YYYY-MM-DD HH:mm:ss,SSS');
              //TODO: 每次插入这个请求会造成解析变慢
              jsonfile.writeFileSync(file, self.app.toRequestJson());
            });
  
            request2.save(err => {
              if (err) {
                console.log("err: ", err);
                return;
              }
            });  
          } else {
            //console.warn("can't find end log: ", doc);
          }
        });

      });

    });
    cursor.on("close", () => {
      self.working = false;     
      //console.log("read db complete");
      setTimeout(()=> {
          self.analyse();
        }, 5000);
    });
  }

}

var config = jsonfile.readFileSync(file);
var analyzer = new RequestAnalyzer(config);
analyzer.analyse();

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`);
  setTimeout(() => {
    var analyzer = new RequestAnalyzer(config);
    analyzer.analyse();
  }, 5000);
});
