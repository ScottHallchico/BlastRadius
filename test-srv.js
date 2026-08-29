const http = require('http');
http.createServer((req,res) => { res.end('hello'); }).listen(3001, '127.0.0.1');
