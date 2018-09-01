/*
Copyright (c) 2018 rtrdprgrmr

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var net = require('net');
var http = require('http');
var url = require('url');
var WebSocket = require('ws');
var HttpProxyAgent = require('http-proxy-agent');

var remote_url = process.argv[2];
var local_port = process.argv[3] || '8881';
var proxy = process.env.http_proxy;

if (!remote_url) {
    console.log("usage:\texport http_proxy=http://proxy-ip:proxy-port");
    console.log("\tnode client ws://remote-ip:remote-port [local_port]");
    process.exit(1);
}

if (proxy) {
    console.log("will connect to " + remote_url + " via " + proxy);
    //TODO
}

net.createServer(sock => {
    var options ={};

    sock.pause();
    var ws = new WebSocket(remote_url, options);
    ws.on('open', () => sock.resume());
    ws.on('close', () => sock.end());
    ws.on('message', data => sock.write(data));
    ws.on('error', () => sock.destroy());
    sock.on('data', data => ws.send(data));
    sock.on('end', () => ws.close());
    sock.on('error', console.error);

}).listen(local_port);
