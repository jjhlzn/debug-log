import { print } from 'util';
var mongoose = require('mongoose');
var assert = require('assert');

mongoose.Promise = require('bluebird');
var db = mongoose.createConnection('mongodb://115.29.199.187/debug_log');
var moment = require('moment');

var logModels = {};
var requestModels = {};

export function getLogModel(log: any, app: any) {
    let modelName = `logs_${app.name}_${moment(log.time).format('YYYY-MM-DD')}`;
    if (logModels[modelName]) {
      return logModels[modelName];
    }
    logModels[modelName]  = db.model(modelName, { 
      time:    Date,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String    
    }, modelName);
    return logModels[modelName];
}

export function getLogModel2(app: any) {
    let modelName = `logs_${app.name}_${moment().format('YYYY-MM-DD')}`;
    if (logModels[modelName]) {
      return logModels[modelName];
    }
    logModels[modelName]  = db.model(modelName, { 
      time:    Date,   //2015-03-18 00:04:26,442
      level:   String,   //Debug
      clazz:   String,   //HDBusiness.BLL.AlipayInfoBLL
      content: String,
      thread: String    
    }, modelName);
    return logModels[modelName];
}

export function getRequestModel(app: any) {
    let modelName = `requests_${app.name}_${moment().format('YYYY-MM-DD')}`;
    if (requestModels[modelName]) {
      return requestModels[modelName];
    }
    requestModels[modelName]  = db.model(modelName, { 
      time: Date,
      ip: String,
      duration: Number,
      url: String,
      startLog: Date,
      endLog: Date,
      thread: String,
      app: String
    }, modelName);
    return requestModels[modelName];
}

export function getCappedRequestModel() {
    let modelName = `requests_capped`;
    requestModels[modelName]  = db.model(modelName, { 
      time: Date,
      ip: String,
      duration: Number,
      url: String,
      startLog: Date,
      endLog: Date,
      thread: String,
      app: String
    }, modelName);
    return requestModels[modelName];
}



