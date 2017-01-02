import { Application } from './models/application';
import { getRequestModel } from './db';


export class RequestLogBind {
  app: Application;

  constructor() {}

  bind() {
    //获取当前未绑定的请求
    let Request = getRequestModel(this.app.name);

    let cursor = Request.find().cursor();

    
    //对每个未绑定的请求，设置其相关的日志
    

  }
}