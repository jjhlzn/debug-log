/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Request = mongoose.model('Request');

var url = require('url');
var querystring = require('querystring');

/**
 * List
 */
exports.index = (req, res) => {
  //console.log("req.url: ", req.url);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  var params = querystring.parse(url.parse(req.url).query);
  console.log("query: ", params);
  Request.list(params, (err, resp) => {
    if (err) {
      console.error(err);
      res.end();
    }
    //console.log(JSON.stringify(logs));
    res.end(JSON.stringify(resp));
  });
}

exports.get = (req, res) => {
  //console.log("req.url: ", req.url);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  //var params = querystring.parse(url.parse(req.url).query);
  console.log("req.params: ", req.params);
  Request.get(req.params, (err, resp) => {
    if (err) {
      console.error(err);
      res.status(err);
      res.end();
    }
    //console.log(JSON.stringify(logs));
    res.end(JSON.stringify(resp));
  });
}

