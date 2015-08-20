/**
 * Created by evio on 15/8/20.
 */
var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var host = require('../package.json').soyiehost;
var querystring = require('querystring');
var pather = '/usr/local/soyie/me.json';
var jszip = require('node-zip');
var clc = require('cli-color');

var model = module.exports = function(name, options, cd){
    if ( !fs.existsSync(pather) ){
        console.log(clc.red('-- error: you have not logined.'));
        return;
    }
    if ( !options ) options = {};
    if ( !cd ) cd = process.cwd();
    var config = require(pather);

    var module_name = name;
    var save = options.save;
    var version = options.version;
    var urlpath = host + '/package/install';
    if ( save ){ module_name = save; }

    var configs = url.parse(urlpath);
    var args = {
        name: module_name,
        version: version,
        guid: config.guid,
        token: config.token
    };
    configs.search = querystring.stringify(args);
    http.get(url.format(configs), function(res){
        var body = [];
        res.on('data', function(chunk){
            body.push(chunk);
        });
        res.on('end', function(){
            body = Buffer.concat(body);
            model.done(res.statusCode, body, cd, !!save);
        });
    });
};

model.done = function(code, body, cd, save){
    if ( code === 200 ){
        var zip = new jszip();
        zip.load(body);
        var pkg = JSON.parse(zip.file('package.json').asText());
        var node_modules = path.resolve(cd || process.cwd(), 'node_modules');
        if ( !fs.existsSync(node_modules) ){
            fs.mkdirSync(node_modules);
        }
        var plguinname = path.resolve(node_modules, pkg.name);
        if ( !fs.existsSync(plguinname) ){
            fs.mkdirSync(plguinname);
        }
        var fds = zip.folder(/.+/);
        var fls = zip.file(/.+/);
        var pm = function(p){
            return path.resolve(plguinname, p);
        };
        fds.forEach(function(dir){
            dir = pm(dir.name);
            if ( !fs.existsSync(dir) ){
                fs.mkdirSync(dir);
            }
        });

        fls.forEach(function(file){
            file = file.name;
            var buf = zip.file(file).asNodeBuffer();
            fs.writeFileSync(pm(file), buf);
        });

        console.log(clc.green('+ install ' + pkg.name + ' success.'));

        var deps = pkg.soyieDeps;
        if ( !deps ) deps = [];

        if ( deps.length ){
            var d = pm('./node_modules');
            if ( !fs.existsSync(d) ){
                fs.mkdirSync(d);
            }
            deps.forEach(function(x){
                console.log(clc.blue('- dep: ' + x));
                model(x);
            });
        }

        if ( save ){
            var m = path.resolve(process.cwd(), 'package.json');
            if ( !fs.existsSync(m) ){
                console.log(clc.yellow('- can not write deps in package.'));
                return;
            }

            var that = require(m);
            var k = that.soyieDeps;
            if ( !k ) that.soyieDeps = [];
            if ( that.soyieDeps.indexOf(pkg.name) == -1 ){
                that.soyieDeps.push(pkg.name);
            }
            fs.writeFileSync(m, JSON.stringify(that));
        }
    }else{
        var ret = JSON.parse(body);
        console.log(clc.red(ret.msg));
    }
};
