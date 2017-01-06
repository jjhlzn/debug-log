import { getLogModel2, getRequestModel, getCappedRequestModel } from './db';
var jsonfile = require('jsonfile');
import { Application } from './models/application';
var file = '../../config/requests.json';
var moment = require('moment');

class RequestAnalyzer {
  app: any;
  working: boolean;
  checking: boolean;

  constructor(config = {}) {
    this.app = new Application(config);
    this.working = false;
    this.checking = false;
  }

  errorHandler: any = (err) => {
    if (err) {
      console.log(err);
      return;
    }
  }

  private findEndLog(log: any, retry:number=0) {
    let self = this;
    let Log = getLogModel2(this.app);
    let Request = getRequestModel(this.app);
    let CappedRequest = getCappedRequestModel();

    //获取开始日志的ip和URL
    let regex = new RegExp("^##############################################IP: (.+)#(.+) 开始处理##############################################");
    let m = regex.exec(log.content);
    if (m == null) return;
    let ip = m[1], url = m[2];
    let maxEndTime = new Date(moment(log.time).add(1, 'm'));

    //寻找请求的结束的标志
    let options = {content: `---------------------------------------------${url} 处理结束---------------------------------------------`,
        thread: log.thread, clazz: log.clazz, time: {$gte: log.time, $lte: maxEndTime}};
    Log.findOne(options)
        .sort({time: 1})
        .exec( (err, endLog) => {
      if (err) {
        console.log(err);
        return;
      }

      if (endLog != null) {
        let duration = moment(endLog.time).diff(moment(log.time));
        let request = new Request({
          time: log.time,
          ip: ip,
          url: url,
          startLog: log.time,
          endLog: endLog.time,
          thread: log.thread,
          duration: duration,
          app: this.app.name
        });

        //console.log(moment(log.time).format('YYYY-MM-DD HH:mm:ss,SSS'), m[1], m[2]);
        self.app.lastParseLog = moment(endLog.time, 'YYYY-MM-DD HH:mm:ss,SSS').format('YYYY-MM-DD HH:mm:ss,SSS');
        //TODO: 每次插入这个请求会造成解析变慢，将解析位置同步到文件中去
        jsonfile.writeFileSync(file, self.app.toRequestJson());

        let request2 = new CappedRequest(request);
        request.save(this.errorHandler);
        request2.save(this.errorHandler);  
      } else {
        if (retry === 0) {
          setTimeout(()=> {
            self.findEndLog(log, 1);
          }, 3000);
        } else {
          console.log("retry: ", retry);
          console.warn("can't find end log: ", moment(log.time).format('HH:mm:ss,SSS'), url);
          console.warn("endLog: ", JSON.stringify(endLog));
          console.log("options: ", JSON.stringify(options));
        }
      }
    });
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

    if (this.app.lastParseLog === '') {
      cursor = Log.find({ content: /##############################################.*/ })
                  .sort({time: 1})
                  .cursor();
    } else {
      cursor = Log.find({ content: /##############################################.*/ })
                  .where('time').gt(new Date(moment(this.app.lastParseLog, 'YYYY-MM-DD HH:mm:ss,SSS')))
                  .sort({time: 1})
                  .cursor();
    }
 
    //真对每个开始标记，查询对应的结束的标记，然后纪录请求，纪录请求的开始日志和结束日志。
    cursor.on("data", (log) => {
      this.findEndLog(log);
    });
    cursor.on("close", () => {
      self.working = false;    
      setTimeout(()=> {
          self.analyse();
        }, 2000);
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
