import { parse } from 'querystring';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
import { getRequestModel } from '../models/requests';

var url = require('url');
var querystring = require('querystring');
var moment = require('moment');

/**
 * List
 */
exports.index = (req, res) => {
  //console.log("req.url: ", req.url);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var params = querystring.parse(url.parse(req.url).query);
  console.log("query: ", params);
  let startTime = params['startTime'] || moment(moment().format('YYYY-MM-DD')).format('YYYY-MM-DD HH:mm:ss');
  let endTime = params['endTime'] || moment().format('YYYY-MM-DD HH:mm:ss');

  let app = params['app'] || 'order';
  let date = moment(startTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
  
  var Request = getRequestModel(app, date);
  

  params.criteria = {
    time: { "$gte": startTime, "$lte": endTime}
  };

  if (params.content) {
    if (params.contentType === 'url') {
      params.criteria.url = new RegExp(`${params.content}`);
    } else if (params.contentType === 'content') {
      
    }
  }

  console.log("criteria: ", params.criteria);

  Request.list(params, (err, resp) => {
    if (err) {
      console.error(err);
      res.end();
    }
    res.end(JSON.stringify(resp));
  });
}

exports.get = (req, res) => {
  //console.log("req.url: ", req.url);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var params = querystring.parse(url.parse(req.url).query);
  console.log("params: ", params);
  let app = params['app'] || 'order';
  let date = params['date'] || moment().format('YYYY-MM-DD');

  let Request = getRequestModel(app, date);
  Request.get(req.params, (err, resp) => {
    if (err) {
      console.error(err);
      res.status(err);
      res.end();
    }
    res.end(JSON.stringify(resp));
  });
}

