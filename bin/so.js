#!/usr/bin/env node

'use strict';

/**
 * Module dependencies.
 */

var program = require('commander');
var path = require('path');
var fs = require('fs');
var config = require('../package.json');
var clc = require('cli-color');

// version.
program.version('0.0.1');

program
    .command('server [port]')
    .description('make server')
    .option('-i, --ip <ipvalue>', 'new ip')
    .action(function(port, options){
        var http = require('http');
        var server = require('../src/server');
        var ip = options.ip ? options.ip : '127.0.0.1';
        port = Number(port || 8000);
        http.createServer(function (req, res) {
            var service = new server(req, res);
            service.listen(ip, port);
        }).listen(port, ip);
        console.log('Server run at ' + clc.magenta('http://' + ip + ':' + port));
    });

program
    .command('create <type> <name>')
    .description('create project or file')
    .option('-b, --bootstrap', 'install bootstrap framework', false)
    .option('-f, --force', 'force to create project or file', false)
    .option('-j, --jquery', 'use jQuery lib', false)
    .action(function(type, name, options){
        switch ( type ){
            case 'project':
                require('../src/project')(name, options);
                break;
            case 'file':
                require('../src/file')(name, options);
                break;
        }
    });

program
    .command('build')
    .description('build project')
    .option('-s, --standalone <umd>', 'model')
    .action(function(options){
        var build = require('../src/build');
        var compiler = new build();
        compiler.build(options);
    });

program.parse(process.argv);