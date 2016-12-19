/*!
 * log-debug
 * Copyright(c) 2009-2016 JIN junhang
 * MIT Licensed
 */

/**
 * parse log
 */
export class LogParser {

  constructor(private db) {}

  parse(logstr: string, app: any) {

    var Log = this.db.model('Log', { 
      time:    String,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String    
    }, "logs_"+app.name);

    const logs = this._parse(logstr);
    return logs.map(log => new Log(log));
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
        time:    m[1],
        thread:  m[2],
        level:   m[3],
        clazz:   m[4],
        content: m[5]
      });
    }
    
    return logs;
  }

}

