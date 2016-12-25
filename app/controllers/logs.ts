import { getLogModel } from '../models/logs';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var url = require('url');
var querystring = require('querystring');
var moment = require('moment');


/**
 * List
 */
exports.index = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var params = querystring.parse(url.parse(req.url).query);
  console.log("query: ", params);

  let date = params['date'] || '2016-12-23';
  let app = params['app'] || 'test';

  var Log = getLogModel(app, date);

  Log.list(params, (err, logs) => {
    if (err) {
      console.error(err);
      res.end();
    }
    console.log("logs.count = ", logs.length);
    //console.log(JSON.stringify(logs));
    res.end(JSON.stringify(logs));
  });
}

