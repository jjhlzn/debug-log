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

/**
 * 改脚本从日志文件中读取日志，解析日志，把解析的日志存储到mongodb，同时，需要把
 * 把目前的解析的
 */
class LogAnalyzer {
  app: Application
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
  }

  analyse() {

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
          const logs = self.parser.parse(data, self.app);
          //console.log("parse complete");
          self.saveLogs(logs);
        })
        .on('end', () => {
          console.log("read complete.");
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
new LogAnalyzer(new LogParser(db), config).analyse();


