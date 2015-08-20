/**
 * Created by evio on 15/8/19.
 */
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var jszip = require('node-zip');
var cwd = process.cwd();
var host = require('../package.json').soyiehost;
var request = require('request');

var model = module.exports = function(){
    var pkgfile = path.resolve(cwd, 'package.json');
    var pather = '/usr/local/soyie/me.json';
    if ( !fs.existsSync(pkgfile) ){
        console.log(clc.red('-- error: miss package.json'));
        return;
    }
    if ( !fs.existsSync(pather) ){
        console.log(clc.red('-- error: you have not logined.'));
        return;
    }

    var pkg = require(pkgfile), dirs = [], files = [];
    var config = require(pather);
    if ( !pkg.files ) pkg.files = [];

    console.log(clc.yellow('- concat files into zip'));

    var localfiles = fs.readdirSync(path.resolve(cwd, './'));
    localfiles.forEach(function(file){
        if (['.DS_Store', '.idea'].indexOf(file) > -1){return;};
        file = path.resolve(cwd, file);
        var stats = fs.statSync(file);
        if ( stats.isFile() ){
            files.push(file);
        }
    });

    pkg.files.forEach(function(file){
       var ret = model.files(path.resolve(cwd, file));
        dirs = dirs.concat(ret.dirs);
        files = files.concat(ret.files);
    });

    var zip = new jszip();

    dirs.forEach(function(dir){
        zip.folder(dir);
    });

    files.forEach(function(file){
        var relatives = path.relative(cwd, file);
        var binary = fs.readFileSync(file);
        zip.file(relatives, binary);
    });

    model.post(zip.generate({compression:'DEFLATE', type: 'nodebuffer'}), config, pkg);
};

model.files = function(pather){
    var stats = fs.statSync(pather);
    if ( stats.isDirectory() ){
        var p = path.relative(cwd, pather);
        var dirs = [p], files = [];
        var z = fs.readdirSync(pather);

        z.forEach(function(file){
            if (['.DS_Store', '.idea'].indexOf(file) > -1){return;};
            var b = path.resolve(pather, file);
            var x = model.files(b);
            dirs = dirs.concat(x.dirs);
            files = files.concat(x.files);
        });
        return {
            dirs: dirs,
            files: files
        }
    }else{
        return {
            dirs: [],
            files: [pather]
        }
    }
};

model.post = function(buffer, config, pkg){
    console.log(clc.cyan('- posting ') + clc.blue(pkg.name + '@' + pkg.version) + clc.green(' ...'));
    request.post({
        url: host + '/package/publish?guid=' + config.guid + '&token=' + config.token,
        formData: {
            binary: {
                value: buffer,
                options: {
                    filename: pkg.name + '.zip',
                    contentType: 'application/zip'
                }
            }
        }
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.log(clc.red('-- Publish failed:', err));
        }
        var data = JSON.parse(body);
        if ( data.code === 0 ){
            console.log(clc.magenta('+ ' + data.data.name + '@' + data.data.version));
        }
    });
};