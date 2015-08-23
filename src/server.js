var url = require('url');
var statics = require('serve-static');
var path = require('path');
var fs = require('fs');
var clc = require('cli-color');

var server = module.exports = function(req, res){
    this.req = req;
    this.res = res;
    this.stacks = [];
};

server.prototype.use = function(fn){
    this.stacks.push(fn);
};

server.prototype.init = function(i){
    if ( !i ) i = 0;
    if ( this.stacks.length > 0 && this.stacks[i] ){
        var stack = this.stacks[i];
        var that = this;
        var next = function(){ that.init(i + 1) };
        stack(this.req, this.res, next);
    }
};

server.prototype.listen = function(ip, port){
    var res = this.res, req = this.req;
    var urlparser = url.parse(req.url);
    var template = urlparser.pathname;

    if ( template === '/' ){
        template = '/index.html';
    }

    var pather = path.resolve(process.cwd(), '.' + template);
    console.log(clc.blue('- ') + clc.magenta('URL GET') + clc.green('[' + new Date() + ']') + ': http://' + ip + ':' + port + pather);
    if ( !fs.existsSync(pather) ){
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 not found.');
    }else{
        this.use(statics(process.cwd()));
        this.use(function(req, res){
            var html = fs.readFileSync(pather, 'utf8');
            var name = path.basename(pather);
            var contenttype = require('content-type-mime');
            var type = contenttype(name);
            res.writeHead(200, {'Content-Type': type});
            res.end(html);
        });
        this.init();
    }
};