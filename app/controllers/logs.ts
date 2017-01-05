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

  let startTime = params['startTime'] || moment(moment().format('YYYY-MM-DD')).format('YYYY-MM-DD HH:mm:ss');
  let endTime = params['endTime'] || moment().format('YYYY-MM-DD HH:mm:ss');
  let app = params['app'] || 'order';
  let date = moment(startTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

  params.criteria = {
    time: { "$gte": startTime, "$lte": endTime}
  };

  if (params.content) {
    params.criteria["content"] = new RegExp(`${params.content}`);
  }

  var Log = getLogModel(app, date);
  Log.list(params, (err, resp) => {
    if (err) {
      console.error(err);
      res.end();
    }
    res.end(JSON.stringify(resp));
  });
}

