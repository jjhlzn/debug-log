import * as console from 'console';
var moment = require('moment');

export class Application {
  name: string
  _parsePosition: number
  lastParseLog: string
  parseTime: any
  filePath: string

  get parsePosition():number {
    if (moment().format('YYYYMMDD') == this.parseTime.format('YYYYMMDD')) {
      return this._parsePosition;
    }
    return 0;
  } 
  set parsePosition(position:number) {
    this._parsePosition = position;
    this.parseTime = moment();
  }

  constructor(options={}) {
    this.name = options["name"] || '';
    this._parsePosition = options["parsePosition"] || 0;
    let time = options["parseTime"] || moment().format('YYYY-MM-DD HH:mm:ss');
    this.parseTime = moment(time, 'YYYY-MM-DD HH:mm:ss');
    this.filePath = options["filePath"];

   
    
    this.lastParseLog = options["lastParseLog"] || '';
  }

  toJson() {
    return {
      name: this.name,
      parsePosition: this.parsePosition,
      parseTime: this.parseTime.format('YYYY-MM-DD HH:mm:ss'),
      filePath: this.filePath
    }
  }

  toRequestJson() {
    return {
      name: this.name,
      lastParseLog: this.lastParseLog
    }
  }
}