
/*
 * 启动多个进程，模拟.net处理请求，产生大量日志
 * 
 */
var fs = require('fs');
var moment = require('moment');

var logFilePath = "./log_root.txt";

function prepare() {
  fs.stat(logFilePath, function(err, stat) {
    if(err == null) {
        //console.log('File exists');
    } else if(err.code == 'ENOENT') {
        // file does not exist
        fs.openSync(logFilePath, 'w');
    } else {
        console.log('Some other error: ', err.code);
    }
});
}

function addSomeTime() {
  var result = 0;
  for(var i = 0; i < 20000; i ++) {
    result += Math.pow(2, i);
  }
  return  result;
}

var requestCount = 0;
function readLines() {
  for(var i = 1; i <= 4; i ++) {
    var thread = Math.ceil(Math.random() * 10000);
    fs.readFileSync(`./logs/log${i}.txt`).toString().split('\n').forEach(function (line) { 
      addSomeTime();
      fs.appendFileSync(logFilePath, line.replace(new RegExp(`([0-9]{4}-[0-9]{2}-[0-9]{2}[ ][0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})[ ]\\[([0-9]{1,3})\\][ ]`), 
                                                        moment().format('YYYY-MM-DD HH:mm:ss,SSS') + ' ['+thread+'] ') + "\n");
    });
    requestCount++;
    console.log("count = ", requestCount);
  } 
}

prepare();

while(1) {
  readLines();
}