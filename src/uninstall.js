/**
 * Created by evio on 15/8/20.
 */
var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');
var clc = require('cli-color');
var model = module.exports = function(name, options){
    var module_name = name;
    var save = options.save;
    if ( save ){ module_name = save; }

    var pather = path.resolve(process.cwd(), 'node_modules', module_name);
    if ( fs.existsSync(pather) ){
        var pkg = require(path.resolve(pather, 'package.json'));
        var version = pkg.version;
        var names = pkg.name;
        fse.removeSync(pather);
        console.log(clc.green('- uninstall ' + names + '@' + version));
        if ( !!save ){
            var m = path.resolve(process.cwd(), 'package.json');
            if ( !fs.existsSync(m) ){
                console.log(clc.yellow('- can not remove deps in package.'));
                return;
            }

            var that = require(m);
            var k = that.soyieDeps;
            if ( !k ) that.soyieDeps = {};
            if ( that.soyieDeps[names] ){
                delete that.soyieDeps[names];
            }
            fs.writeFileSync(m, JSON.stringify(that));
        }
    }else{
        console.log(clc.yellow('no such package.'));
    }
};