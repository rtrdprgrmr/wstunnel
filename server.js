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

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8001;
var to_host = process.argv[2] || '127.0.0.1';
var to_port = +process.argv[3] || 22;

var server = new WebSocket.Server({
    port: 8080
});

server.on('connection', ws => {
    console.log("session arrived");
    var sock = net.connect(to_port, to_host, () => {
        console.log("session connected");
        sock.emit('drain');
    });
    var pending = [];
    var busy = true;
    ws.on('message', data => {
        if (busy) {
            pending.push(data);
        } else {
            busy = sock.write(data);
        }
    });
    sock.on('drain', () => {
        busy = false;
        while (pending.length > 0) {
            var data = pending.shift();
            busy = sock.write(data);
            if (busy) return;
        }
    });
    sock.on('error', e => {
        console.log("session error");
    });
    sock.on('data', data => ws.send(data));
    sock.on('end', () => ws.close());
});
