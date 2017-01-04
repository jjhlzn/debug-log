import { setInterval, setTimeout } from 'timers';
/*!
 * log-debug
 * Copyright(c) 2009-2016 JIN junhang
 * MIT Licensed
 */
var fs = require('fs');
const join = require('path').join;
var mongoose = require('mongoose');
import { LogParser } from './log-parser';
import { db } from './models/models';
var jsonfile = require('jsonfile');
import { Application } from './models/application';
var file = '../../config/default.json';
var moment = require('moment');

/**
 * 改脚本从日志文件中读取日志，解析日志，把解析的日志存储到mongodb，同时，需要把
 * 把目前的解析的
 */
class LogAnalyzer {
  app: Application
  working: boolean
  /**
   * config: 传递给LogAnalyzer的配置信息
   * 例如：
   * config = {
   *   app: {
   *     name: ’hengdian_order_system‘,
   *     lastParsePosition: 0,
   *     lastParseTime: '2016-01-01'
   *   }
   * }
   */
  constructor(private parser: LogParser, config = {}) { 
    this.app = new Application(config);
    this.working = false;
  }

  analyse() {
    if (this.working) {
      console.log("analyse is working now...");
      return;
    }

    this.working = true;

    //每天的前30分钟，检查文件大小和解析的大小
    let now = moment();
    //console.log("now.hour() === 0 && now.minute() < 5: ", now.hour() === 0 && now.minute() < 5);
    if (now.hour() === 0 && now.minute() < 30) {
      let fileStat = fs.statSync(self.getLogFilePath());
      if (fileStat.size < this.app.parsePosition) {
        this.app.parsePosition = 0;
      }
    }

    //3. 循环 
    //    3.1 读取日志内容
    //    3.2 解析日志
    //    3.3 将解析的日志保存到mongodb
    //    3.4 更新文件的解析日志
    var self = this;
    var readStream = fs.createReadStream(self.getLogFilePath(),  {start: this.app.parsePosition, flags: 'r'});
    readStream.setEncoding('UTF-8');
    readStream
        .on('data', function (data) {
          //console.log(`new log data: ${data}`);
          //console.log('--------------------------------------------------------------');
          self.app.parsePosition += Buffer.byteLength(data, 'UTF-8');
          console.log('parsePosition: ', self.app.parsePosition);
          jsonfile.writeFileSync(file, self.app.toJson());
          const logsArray = self.parser.parse(data, self.app);
          //console.log("parse complete");
          self.saveLogs(logsArray[0]);
          self.saveLogs(logsArray[1]);
        })
        .on('end', () => {
          console.log("read complete.");
          this.working = false;
          setTimeout(()=> {
            self.analyse();
          }, 2000);
        })
        .on('error', (err) => {
          console.error("readStream err", err);
        });
  }

  saveLogs(logs) {
    logs.forEach(log => {
      log.save((err) => { 
        if (err) 
          console.error("err", err);
        //console.log("save complete!");
        });
    });
  }

  /**
  * 每个项目的日志文件的存储路径是不一样的，所以这个地方应该是可配置的
  */
  getLogFilePath() {
    return this.app.filePath;
  }
}

var config = jsonfile.readFileSync(file);
var analyzer = new LogAnalyzer(new LogParser(db), config);
analyzer.analyse();

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`);
  setTimeout(()=> {
    var analyzer = new LogAnalyzer(new LogParser(db), config);
    analyzer.analyse();
  }, 5000);
});



