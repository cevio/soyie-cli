/**
 * Created by evio on 15/8/19.
 */
var prompt = require('cli-prompt');
var request = require('request');
var clc = require('cli-color');
var fs = require('fs');
var host = require('../package.json').soyiehost;

module.exports = function(){
    prompt.multi([
        {
            label: 'Input your name (must be at least 4 characters)',
            key: 'username',
            default: '',
            validate: function (val) {
                if (val.length < 4) {
                    throw new Error ('username.length must be >= 4');
                }
            }
        },
        {
            label: 'Input your password (must be at least 6 characters)',
            key: 'password',
            type: 'password',
            validate: function (val) {
                if (val.length < 6){
                    throw new Error('password must be at least 6 characters long')
                }
            }
        }
    ], function(options){
        console.log(clc.blue('requesting...'));
        request.post({
            url: host + '/user/login',
            form: {
                username: options.username,
                password: options.password
            }
        }, function(err, httpResponse, body){
            var data = JSON.parse(body);
            if ( data.code === 0 ){
                var pather = '/usr/local/soyie';
                if ( !fs.existsSync(pather) ){
                    fs.mkdirSync(pather);
                }
                pather = pather + '/me.json';
                fs.writeFileSync(pather, JSON.stringify(data.data));
                console.log(clc.magenta('login success!'));
            }else{
                console.log(clc.red(data.msg));
            }
        });
    });
};