/**
 * Created by evio on 15/8/18.
 */
var host = 'http://h5.51.nb/resources/soyie-resources.zip';
var clc = require('cli-color');
var JSZip = require('node-zip');
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var fse = require('fs-extra');

var model = module.exports = function(options){
    if ( options.global ){
        model.updateGlobal();
    }else{
        model.updateLocal(options);
    }
};

model.updateGlobal = function(){
    var hostParse = url.parse(host);
    var options = {
        host: hostParse.host,
        port: 80,
        path: hostParse.pathname
    };
    http.get(options, function(res) {
        var data = [], dataLen = 0;
        res
            .on('data', function(chunk) {
                data.push(chunk);
                dataLen += chunk.length;
            })
            .on('end', function() {
                var buf = new Buffer(dataLen);
                for (var i=0, len = data.length, pos = 0; i < len; i++) {
                    data[i].copy(buf, pos);
                    pos += data[i].length;
                }
                var zip = new JSZip(buf, { base64: false });
                var fds = zip.folder(/.+/);
                var fls = zip.file(/.+/);

                fds.forEach(function(dir){
                    if ( /^\_\_MACOSX/.test(dir.name) ) return;
                    var pather = path.resolve(__dirname, '..', 'res', dir.name);
                    if ( !fs.existsSync(pather) ){
                        console.log('-- ' + clc.blue('make dir:') + ' ' + pather);
                        fs.mkdirSync(pather);
                    }
                });

                fls.forEach(function(file){
                    if ( /^\_\_MACOSX/.test(file.name) ) return;
                    var pather = path.resolve(__dirname, '..', 'res', file.name);
                    var content = zip.file(file.name).asNodeBuffer();
                    fs.writeFileSync(pather, content);
                    console.log('-- ' + clc.green('make file:') + ' ' + pather);
                });

                console.log(clc.bgGreen('update new resources success!'));
            });
    });
};

model.updateLocal = function(options){
    var pkg_path = path.resolve(process.cwd(), './package.json');
    if ( !fs.existsSync(pkg_path) ){
        console.log(clc.red('this dir is not a soyie project.'));
    }else{
        var pkg = fse.readJsonSync(pkg_path);
        pkg = pkg.soyieRenderConfigs;
        var resources = path.resolve(__dirname, '..', 'res');
        var copy = function(source, target){
            source = path.resolve(resources, source);
            target = path.resolve(process.cwd(), 'src', target);
            fse.copySync(source, target);
            console.log('-- ' + clc.blue(target) + ' updated.')
        };
        copy('src/lib/soyie.js', 'lib/soyie.js');
        copy('src/lib/soyie-require.js', 'lib/soyie-require.js');
        if ( pkg.bootstrap || pkg.jquery ){
            copy('src/lib/jquery.js', 'lib/jquery.js');
        }

        if ( pkg.bootstrap ){
            copy('src/lib/bootstrap/js/bootstrap.js', 'lib/bootstrap.js');
            copy('src/lib/bootstrap/css', 'css');
            copy('src/lib/bootstrap/fonts', 'fonts');
        }

        if ( options.force ){
            copy('common/gitattributes.so', '../.gitattributes');
            copy('common/gitignore.so', '../.gitignore');
            copy('common/LICENSE.txt', '../LICENSE.txt');
        }
        console.log(clc.bgGreen('update new resources success!'));
    }
};

model.dir = function(pather){
    var target = path.resolve(process.cwd(), 'src', target);
    if ( !fs.existsSync(pather) ){
        fs.mkdirSync(target);
    }
};