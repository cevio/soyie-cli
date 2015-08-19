/**
 * Created by evio on 15/8/19.
 */
var fs = require('fs');
var clc = require('cli-color');
var request = require('request');
var host = require('../package.json').soyiehost;
module.exports = function(){
    var pather = '/usr/local/soyie/me.json';
    if ( !fs.existsSync(pather) ){
        console.log('please regist or login!');
    }else{
        console.log(clc.blue('- Local: ' + JSON.stringify(require(pather))));
        console.log(clc.magenta('- Remote: wait for remote origin...'));
        var config = require(pather);
        request.post({
            url: host + '/user/status',
            form: {
                guid: config.guid,
                token: config.token
            }
        }, function(err, httpResponse, body){
            var data = JSON.parse(body);
            if ( data.code === 0 ){
                console.log(clc.bgGreen('- Remote: logined.'));
            }else{
                console.log(clc.red(data.msg));
            }
        });
    }
};