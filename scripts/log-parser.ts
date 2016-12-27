/*!
 * log-debug
 * Copyright(c) 2009-2016 JIN junhang
 * MIT Licensed
 */
var moment = require('moment');

/**
 * parse log
 */
export class LogParser {

  CappedLog: any;
  constructor(private db) {
    this.CappedLog = this.db.model('CappedLog', {
      time:    Date,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String,
      app: String
    }, 'logs_capped');
  }

  models = {}
  private getModel(log: any, app: any) {
    let modelName = `logs_${app.name}_${moment(log.time).format('YYYY-MM-DD')}`;
    if (this.models[modelName]) {
      return this.models[modelName];
    }
    this.models[modelName]  = this.db.model(modelName, { 
      time:    Date,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String    
    }, modelName);
    return this.models[modelName];
  }

  parse(logstr: string, app: any) {
    let logs = this._parse(logstr);
    logs = logs.map(log => { 
      let Log = this.getModel(log, app);
      return new Log(log);
    });
    let logs2 = logs.map(log => {
      let log0 = new this.CappedLog(log);
      log0.app = app.name;
      return log0;
    });
    return [logs, logs2];
  }

  /** 
   *  解析日志文本
   */
  _parse(logstr: string) { 

    /*
    下面这个正则表达式可以在该网站：https://regex101.com 测试通过，用的是php的格式。（javascript不支持忽略空格的方式）
    ([0-9]{4}-[0-9]{2}-[0-9]{2}[ ][0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})[ ]
    \[([0-9]{1,3})\][ ]
    ([A-Z]{1,10})[ ]{1,}
    (\w+(?:\.\w+){0,})[ ]
    \[\(\w{1,}\)\][ ]
    -[ ]
    (.*?)
    ((?=([0-9]{4}-[0-9]{2}-[0-9]{2}[ ][0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3}){1})|$)
    */
    const logs = [];
    const regex = new RegExp(`([0-9]{4}-[0-9]{2}-[0-9]{2}[ ][0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})[ ]`
                            +`\\[([0-9]{1,3})\\][ ]`
                            +`([A-Z]{1,10})[ ]{1,}`
                            +`(\\w+(?:\\.\\w+){0,})[ ]`
                            +`\\[\\(\\w{1,}\\)\\][ ]`
                            +`-[ ]`
                            +`(.*?)`
					                  +`((?=([0-9]{4}-[0-9]{2}-[0-9]{2}[ ][0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3}){1})|$)`,
                            'mg');

    

    let m;
    while ((m = regex.exec(logstr)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      
      logs.push({
        time:    moment(m[1], 'YYYY-MM-DD HH:mm:ss,SSS').toISOString(),
        thread:  m[2],
        level:   m[3],
        clazz:   m[4],
        content: m[5]
      });
    }
    
    return logs;
  }

}

