/**
 * Created by evio on 15/8/16.
 */
var cwd = process.cwd();
var fse = require('fs-extra');
var fs = require('fs');
var clc = require('cli-color');
var path = require('path');

var model = module.exports = function(name, options){
    var config = {};
    var pkg = model.path('./package.json');
    if ( fs.existsSync(pkg) ){
        config = fse.readJsonSync(pkg);
        if ( config.isSoyie ){
            config = config.soyieRenderConfigs;
            config.force = !!options.force;
            model.handle(name, config);
        }else{
            console.log(clc.red('error: this dir is not a soyie project'));
        }
    }else{
        console.log(clc.red('error: this dir is not a soyie project'));
    }
};

model.handle = function(name, options){
    model.createHTML(name, options);
    model.createScriptFile(name, options);
    console.log(clc.bgGreen('# soyie create project file [' + name + '] success!'));
};

model.createHTML = function(name, options){
    if ( !options.force && fs.existsSync(model.path('./src/' + name + '.html')) ){
        console.log(clc.red('error: project\'s file of ' + name + ' is existed.'));
        process.exit(1);
        return;
    }
    var html = fs.readFileSync(path.resolve(__dirname, '..', './res/template.html'), 'utf8');
    if ( options.bootstrap ){
        var bootstrapCss = [], bootstrapSupportScript = [];
        var bootstrapCsses = [
            'css/bootstrap.css',
            'css/bootstrap-theme.css',
            'css/font-awesome.css'
        ];
        bootstrapCsses.forEach(function(url){
            bootstrapCss.push(model.createCss(url));
        });
        bootstrapCss = ['<!--css:start:' + name + '.css-->'].concat(bootstrapCss);
        bootstrapCss.push('<!--css:end-->');
        html = html.replace('{bootstrap-css}', bootstrapCss.join('\n'));
        [
            '<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->',
            '<!-- WARNING: Respond.js doesn\'t work if you view the page via file:// -->',
            '<!--[if lt IE 9]>',
            'http://cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js',
            'http://cdn.bootcss.com/respond.js/1.4.2/respond.min.js',
            '<![endif]-->'
        ].forEach(function(url){
                bootstrapSupportScript.push(/^http/.test(url) ? model.createScript(url) : url);
            });
        html = html.replace('{bootstrap-support-js}', bootstrapSupportScript.join('\n'));
    }else{
        html = html.replace('{bootstrap-css}', '<!--css:start:' + name + '.css-->\n<!--css:end-->');
        html = html.replace('{bootstrap-support-js}', '');
    }

    var scripts = [model.createScript('lib/soyie-require.js')];
    scripts.push("<script>SoyieRequire('./js/" + name + "');</script>");
    scripts = ['<!--script:start:' + name + '.js-->'].concat(scripts);
    scripts.push('<!--script:end-->');
    html = html.replace('{bootstrap-script}', scripts.join('\n'));

    fs.writeFileSync(model.path('./src/' + name + '.html'), html);
    console.log('--- ' + clc.magenta('Create HTML File: ') + clc.blue(model.path('./src/' + name + '.html')) + ' -> ' + clc.green('success!'));
};

model.createScriptFile = function(name, options){
    var code = [];
    if ( options.jquery || options.bootstrap ){
        code.push("var jQuery = require('../lib/jquery');");
        code.push("if ( typeof window.jQuery === 'undefined' ) window.$ = window.jQuery = jQuery;");
    }
    if ( options.bootstrap ){
        code.push("require('../lib/bootstrap');");
    }
    code.push("require('../lib/soyie');");
    fs.writeFileSync(model.path('./src/js/' + name + '.js'), code.join('\n'));
    console.log('--- ' + clc.magenta('Create Script File: ') + clc.blue(model.path('./src/js/' + name + '.js')) + ' -> ' + clc.green('success!'));
};

model.createCss = function(url){
    return '<link href="' + url + '" rel="stylesheet" />';
};

model.createScript = function(url){
    return '<script src="' + url + '"></script>';
};

model.path = function( pather ){
    return path.resolve(cwd, pather);
};