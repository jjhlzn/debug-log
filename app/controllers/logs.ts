import * as console from 'console';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var url = require('url');
var querystring = require('querystring');
var Log = mongoose.model('Log');

/**
 * List
 */
exports.index = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var params = querystring.parse(url.parse(req.url).query);
  console.log("query: ", params);

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

