/**
 * Created by evio on 15/8/15.
 */
var cwd = process.cwd();
var fs = require('fs');
var path = require('path');
var clc = require('cli-color');
var fse = require('fs-extra');
var config = fse.readJsonSync(path.resolve(__dirname, '../package.json'));

var model = module.exports = function(name, options){
    model.createDir(name, options);
    process.chdir(model.path('./' + name));
    cwd = process.cwd();
    model.moveCommonFiles(name, options);
    model.createSrc(options);
    model.createHTML(options);
    model.createScriptFile(options);
    console.log(clc.bgGreen('# soyie Project [' + name + '] created success!'));
};

model.path = function( pather ){
    return path.resolve(cwd, pather);
};

model.createDir = function(name, options){
    var dir = model.path('./' + name);
    var exist = fs.existsSync(dir);
    if ( !exist ){
        console.log('create dir ' + clc.magenta('[' + dir + ']') + ' done..');
        fs.mkdirSync(dir);
    }else{
        if ( !options.force ){
            console.log('Project [ ' + clc.red(name) + ' ] exist! \nUse option' + clc.blue('[-f, --force]') + ' to create' + ' it.');
        }else{
            console.log('create dir ' + clc.magenta('[' + dir + ']') + clc.bgBlack(' force ') + ' done..');
        }
    }
};

model.moveCommonFiles = function(name, options){
    model.copy({
        'gitattributes.so': '.gitattributes',
        'gitignore.so': '.gitignore',
        'LICENSE.txt': 'LICENSE.txt'
    }, './res/common/');
    fs.writeFileSync(model.path('./README.md'), '## ' + name + ' ##\n\nA new project.');
    console.log('--- ' + clc.magenta('Create File: ') + clc.yellow(model.path('./README.md')) + ' -> ' + clc.green('success!'));
    var srcDir = model.path('./src');
    if ( !fs.existsSync(srcDir) ){
        fs.mkdirSync(srcDir);
    }
    var JSONS = {
        "name": name,
        "description": "A new Soyie project.",
        "version": "0.0.1",
        "licenses": [
            {
                "type": "MIT"
            }
        ],
        "dependencies": {},
        "isSoyie": true,
        "files": []
    };

    JSONS.soyieRenderConfigs = {};
    JSONS.soyieRenderConfigs['jquery'] = !!options.jquery;
    JSONS.soyieRenderConfigs['bootstrap'] = !!options.bootstrap;

    fse.outputJson(model.path('./package.json'), JSONS);
    console.log('--- ' + clc.magenta('Create File: ') + clc.yellow(model.path('./package.json')) + ' -> ' + clc.green('success!'));
};

model.copy = function(list, dir){
    for ( var i in list ){
        var source = path.resolve(__dirname, '..', dir + i);
        var target = model.path('./' + list[i]);
        fse.copySync(source, target);
        console.log('--- ' + clc.magenta('Create File: ') + clc.yellow(target) + ' -> ' + clc.green('success!'));
    }
};

model.createSrc = function(options){
    model.dir('./src/lib');
    model.dir('./src/js');
    model.dir('./src/css');
    model.dir('./src/fonts');
    var coms = {
        'soyie.js': './src/lib/soyie.js',
        'soyie-require.js': './src/lib/soyie-require.js'
    };
    if ( options.jquery || options.bootstrap ){
        coms['jquery.js'] = './src/lib/jquery.js';
    };
    model.copy(coms, './res/src/lib/');

    if ( options.bootstrap ){
        model.copy({
            'css/bootstrap.css': './src/css/bootstrap.css',
            'css/bootstrap-theme.css': './src/css/bootstrap-theme.css',
            'css/font-awesome.css': './src/css/font-awesome.css'
        }, './res/src/lib/bootstrap/');
        model.copy({
            'fonts/fontawesome-webfont.eot': './src/fonts/fontawesome-webfont.eot',
            'fonts/fontawesome-webfont.svg': './src/fonts/fontawesome-webfont.svg',
            'fonts/fontawesome-webfont.ttf': './src/fonts/fontawesome-webfont.ttf',
            'fonts/fontawesome-webfont.woff': './src/fonts/fontawesome-webfont.woff',
            'fonts/fontawesome-webfont.woff2': './src/fonts/fontawesome-webfont.woff2',
            'fonts/FontAwesome.otf': './src/fonts/FontAwesome.otf',
            'fonts/glyphicons-halflings-regular.eot': './src/fonts/glyphicons-halflings-regular.eot',
            'fonts/glyphicons-halflings-regular.svg': './src/fonts/glyphicons-halflings-regular.svg',
            'fonts/glyphicons-halflings-regular.ttf': './src/fonts/glyphicons-halflings-regular.ttf',
            'fonts/glyphicons-halflings-regular.woff': './src/fonts/glyphicons-halflings-regular.woff',
            'fonts/glyphicons-halflings-regular.woff2': './src/fonts/glyphicons-halflings-regular.woff2',
        }, './res/src/lib/bootstrap/');
        model.copy({
            'js/bootstrap.js': './src/lib/bootstrap.js'
        }, './res/src/lib/bootstrap/');
    }
};

model.createHTML = function(options){
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
        bootstrapCss = ['<!--css:start:index.css-->'].concat(bootstrapCss);
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
        html = html.replace('{bootstrap-css}', '<!--css:start:index.css-->\n<!--css:end-->');
        html = html.replace('{bootstrap-support-js}', '');
    }

    var scripts = [model.createScript('lib/soyie-require.js')];
    scripts.push("<script>SoyieRequire('./js/index');</script>");
    scripts = ['<!--script:start:index.js-->'].concat(scripts);
    scripts.push('<!--script:end-->');
    html = html.replace('{bootstrap-script}', scripts.join('\n'));

    fs.writeFileSync(model.path('./src/index.html'), html);
    console.log('--- ' + clc.magenta('Create HTML File: ') + clc.blue(model.path('./src/index.html')) + ' -> ' + clc.green('success!'));
};

model.createScriptFile = function(options){
    var code = [];
    if ( options.jquery || options.bootstrap ){
        code.push("var jQuery = require('../lib/jquery');");
        code.push("if ( typeof window.jQuery === 'undefined' ) window.$ = window.jQuery = jQuery;");
    }
    if ( options.bootstrap ){
        code.push("require('../lib/bootstrap');");
    }
    code.push("require('../lib/soyie');");
    fs.writeFileSync(model.path('./src/js/index.js'), code.join('\n'));
    console.log('--- ' + clc.magenta('Create Script File: ') + clc.blue(model.path('./src/js/index.js')) + ' -> ' + clc.green('success!'));
};

model.createCss = function(url){
    return '<link href="' + url + '" rel="stylesheet" />';
};

model.createScript = function(url){
    return '<script src="' + url + '"></script>';
};

model.dir = function(pather){
    var dist = model.path(pather);
    if ( !fs.existsSync(dist) ){
        fs.mkdirSync(dist);
    }
    console.log('--- ' + clc.magenta('Create Dir: ') + clc.red(dist) + ' -> ' + clc.green('success!'));
};