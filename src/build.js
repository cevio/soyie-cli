/**
 * Created by evio on 15/8/15.
 */
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var cssmin = require('cssmin');
var browserify = require('browserify');
var uglify = require('uglify-js');
var htmlminify = require('html-minifier').minify;
var clc = require('cli-color');
var cwd = process.cwd();

var model = module.exports = function(){
    this.pkg = model.path('./package.json');
};

model.prototype.build = function(options){
    if ( fs.existsSync(this.pkg) ){
        var config = fse.readJsonSync(this.pkg);
        if ( config.isSoyie ){
            this.config = config.soyieRenderConfigs;
            this.files = config.files;
            this.handle(options);
        }else{
            console.log(clc.red('error: this dir is not a soyie project'));
        }
    }else{
        console.log(clc.red('error: this dir is not a soyie project'));
    }
};

model.prototype.handle = function(options){
    var src = model.path('./src');
    var that = this;
    model.dir('./dist');
    model.dir('./dist/css');
    model.dir('./dist/js');
    var source = model.path('./src/fonts');
    var target = model.path('./dist/fonts');
    fse.copySync(source, target);
    this.copyFiles();
    if ( fs.existsSync(src) ){
        var files = fs.readdirSync(src);
        for ( var index in files ){
            var file = files[index];
            var pather = model.path('./src/' + file);
            var stats = fs.statSync(pather);
            if ( stats.isFile() ){
                that.compile(pather, options);
            }
        }
    }else{
        console.log(clc.red('error: compiler can not find the src dir.'));
    }
};

model.prototype.copyFiles = function(){
    if ( this.soyiefiles && this.soyiefiles.length ){
        var that = this;
        this.soyiefiles.forEach(function(file){
            var source = model.path(file);
            var dist = path.relative(model.path('./src'), source);
            var target = path.resolve(cwd, './dist', dist);
            that.autoCreate(path.dirname(target));
            fse.copySync(source, target);
        });
    }
};

model.prototype.autoCreate = function(dir){
    var p = '/';
    dir.split('/').slice(1).forEach(function(d){
        p = p + '/' + d;
        if ( !fs.existsSync(p) ){
            fs.mkdirSync(p);
        }
    });
};

model.prototype.compile = function(pather, options){
    var ext = path.extname(pather).toLowerCase();
    var filename = path.basename(pather);
    var that = this;
    if ( ext === '.html' ){
        var html = fs.readFileSync(pather, 'utf8');
        html = this.buildCss(html);
        this.buildScript(html, options, function(html){
            console.log(clc.blue('- ') + clc.magenta('compress:html > start'));
            var result = htmlminify(html, {removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            var htmlPath = model.path('./dist/' + filename);
            fs.writeFileSync(htmlPath, result);
            console.log(clc.blue('- ') + clc.greenBright('compress:html > success > ') + htmlPath);
            console.log(clc.bgGreen('# soyie build cli success!'));
        });
    }
};

model.prototype.buildCss = function(html){
    var a = /\<\!\-\-css\:start\:([^\-\-\>]+?)\-\-\>([\S\s]+?)\<\!\-\-css\:end\-\-\>/i.exec(html);
    if ( a ){
        var outputfile = a[1];
        var depcsses = a[2];
        var matchers = depcsses.match(/href\=(["|'])([^\1]+?)\1/ig);
        if ( matchers && matchers.length ){
            var files = [];
            matchers.forEach(function(matcher){
                var ex = /href\=(["|'])([^\1]+?)\1/i.exec(matcher);
                var url = ex[2];
                var p = path.resolve(cwd, './src', url);
                files.push(p);
            });
            if ( files.length ){
                var csspath = path.resolve(cwd, './dist/css', outputfile);
                console.log(clc.blue('- ') + clc.magenta('compress:css > start'));
                files.forEach(function(file){
                    console.log(clc.blue('- ') + file);
                });
                fs.writeFileSync(csspath, cssmin(concat(files)));
                console.log(clc.blue('- ') + clc.green('compress:css > success > ') + clc.yellow(csspath));
                html = html.replace(
                    /\<\!\-\-css\:start\:([^\-\-\>]+?)\-\-\>([\S\s]+?)\<\!\-\-css\:end\-\-\>/i,
                    model.createCss('css/' + outputfile)
                );
            }
        }
    }
    return html;
};

model.prototype.buildScript = function(html, options, callback){
    var a = /\<\!\-\-script\:start\:([^\-\-\>]+?)\-\-\>([\S\s]+?)\<\!\-\-script\:end\-\-\>/i.exec(html);
    if ( a ){
        var outputfile = a[1];
        var depscripts = a[2];
        var matchers = /SoyieRequire\((["|'])([^\1]+?)\1\)/.exec(depscripts);
        if ( matchers ){
            var url = matchers[2];
            var ext = path.extname(url).toLowerCase();
            if ( ['.js', '.json'].indexOf(ext) === -1 ){ url += '.js'; }
            var scriptpath = path.resolve(cwd, './dist/js', outputfile);
            var dpath = path.resolve(cwd, './src', url);
            console.log(clc.blue('- ') + clc.magenta('compress:js > start'));
            console.log(clc.blue('- ') + clc.yellow('compress:js:browserify start > ') + dpath);
            //standalone: cmd
            var bundle = browserify(dpath, {
                standalone: options.standalone
            }).bundle();
            bundle.on('error', function(err) {
                if (err.stack) {
                    console.error(err.stack);
                }else{
                    console.error(String(err));
                }
                process.exit(1);
            });
            bundle.pipe(fs.createWriteStream(scriptpath)).on('finish', function(){
                console.log(clc.blue('- ') + clc.green('compress:js:browserify success > ') + scriptpath);
                console.log(clc.blue('- ') + clc.yellow('compress:js:uglify start > ') + scriptpath);
                var result = uglify.minify(scriptpath);
                fs.writeFileSync(scriptpath, result.code, 'utf8');
                console.log(clc.blue('- ') + clc.green('compress:js:gulify success > ') + scriptpath);
                console.log(clc.blue('- ') + clc.cyan('compress:js > success'));
                html = html.replace(
                    /\<\!\-\-script\:start\:([^\-\-\>]+?)\-\-\>([\S\s]+?)\<\!\-\-script\:end\-\-\>/i,
                    model.createScript('js/' + outputfile)
                );
                callback(html);
            }).on('error', function(){
                console.error('task catch error.');
            });
        }
    }
};

model.path = function(pather){
    return path.resolve(cwd, pather);
};

model.dir = function(pather){
    var dist = model.path(pather);
    if ( !fs.existsSync(dist) ){
        fs.mkdirSync(dist);
    }
    console.log('--- ' + clc.magenta('Create Dir: ') + clc.red(dist) + ' -> ' + clc.green('success!'));
};

model.createCss = function(url){
    return '<link href="' + url + '" rel="stylesheet" />';
};

model.createScript = function(url){
    return '<script src="' + url + '"></script>';
};

function concat(arr){
    var html = [];
    arr.forEach(function(a){
        html.push(fs.readFileSync(a, 'utf8'));
    });
    return html.join('');
}